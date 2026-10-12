import {
  CorrectionCandidate,
  EngineConfig,
  EngineResult,
  ProtectedSpan,
  Rule,
} from './types';
import { findProtectedSpans } from './protectedSpans';
import { segmentSentences } from './segmenter';
import { SEED_RULES, OFFICIAL_GRAMMAR_RULES } from './rules';
import { shouldGuardCandidate, OFFICIAL_GRAMMAR_EXCEPTIONS } from './guards';
import { validateRulesSchema, validateExceptionsSchema } from './schemaValidator';
import { analyzeClausesAndDiscourse, extractDependencyCandidates } from './clauseAnalyzer';
import { analyzeConditionals, CONDITIONAL_RULES } from './conditionals';

export class IdiomOptimaEngine {
  private rules: Rule[];
  private isRulesValid: boolean = true;
  private isExceptionsValid: boolean = true;
  private schemaErrors: string[] = [];

  constructor(customRules?: Rule[]) {
    // Schema validation on load: fail closed if malformed
    const rulesCheck = validateRulesSchema(customRules ? { schemaVersion: '0.1.0', rules: customRules } : OFFICIAL_GRAMMAR_RULES);
    const exceptionsCheck = validateExceptionsSchema(OFFICIAL_GRAMMAR_EXCEPTIONS);

    this.isRulesValid = rulesCheck.isValid;
    this.isExceptionsValid = exceptionsCheck.isValid;

    if (!rulesCheck.isValid) {
      this.schemaErrors.push(...rulesCheck.errors);
      console.error('IdiomOptima Rules Schema Validation Failed:', rulesCheck.errors);
    }
    if (!exceptionsCheck.isValid) {
      this.schemaErrors.push(...exceptionsCheck.errors);
      console.error('IdiomOptima Exceptions Schema Validation Failed:', exceptionsCheck.errors);
    }

    // Fail-closed: if schema is invalid, no rules are loaded
    if (!this.isRulesValid || !this.isExceptionsValid) {
      this.rules = [];
    } else {
      this.rules = [...(customRules || SEED_RULES)];
      for (const cr of CONDITIONAL_RULES) {
        if (!this.rules.some((r) => r.id === cr.id)) {
          this.rules.push(cr);
        }
      }
    }
  }

  public getRules(): Rule[] {
    return this.rules;
  }

  public getSchemaStatus(): { isValid: boolean; errors: string[] } {
    return {
      isValid: this.isRulesValid && this.isExceptionsValid,
      errors: this.schemaErrors,
    };
  }

  public process(inputText: string, config: EngineConfig): EngineResult {
    const startTime = performance.now();

    // Safe Feature Flag: If engine is disabled, bypass and return original text immediately
    if (config.mode === undefined || (config as any).enabled === false) {
      return {
        originalText: inputText,
        outputText: inputText,
        mode: config.mode || 'autoApply',
        protectedSpans: [],
        candidates: [],
        appliedCandidates: [],
        suggestedCandidates: [],
        suppressedCandidates: [],
        sentencesCount: segmentSentences(inputText).length,
        passesExecuted: 0,
        processingTimeMs: 0,
        hasChanged: false,
      };
    }

    // Fail closed if schema is invalid
    if (!this.isRulesValid || !this.isExceptionsValid) {
      return {
        originalText: inputText,
        outputText: inputText,
        mode: config.mode,
        protectedSpans: [],
        candidates: [],
        appliedCandidates: [],
        suggestedCandidates: [],
        suppressedCandidates: [],
        sentencesCount: segmentSentences(inputText).length,
        passesExecuted: 0,
        processingTimeMs: 0,
        hasChanged: false,
      };
    }

    const maxPasses = config.maxPasses || 3;
    let currentText = inputText;
    let passesExecuted = 0;

    const allCandidates: CorrectionCandidate[] = [];
    const appliedCandidates: CorrectionCandidate[] = [];
    const suggestedCandidates: CorrectionCandidate[] = [];
    const suppressedCandidates: CorrectionCandidate[] = [];

    // Oscillation detector: track past states to stop loops (EX-LOOP-001)
    const seenStates = new Set<string>();
    seenStates.add(currentText);

    let protectedSpans: ProtectedSpan[] = [];
    let textModifiedInPass = true;

    // Iterative passes capped by maxPasses with loop guard
    while (textModifiedInPass && passesExecuted < maxPasses) {
      passesExecuted++;
      textModifiedInPass = false;

      // 1. Protected-span scan before rule matching
      protectedSpans = findProtectedSpans(currentText, config.skipDirectQuotes ?? false);

      // 2. Sentence segmentation
      const sentences = segmentSentences(currentText);

      // 3. Rule matching pass across active enabled rules
      const passCandidates: CorrectionCandidate[] = [];

      for (const rule of this.rules) {
        if (!rule.enabled) continue;

        // Only regex rules can run deterministically without full dependency parser
        if (rule.match.type !== 'regex' || typeof rule.match.pattern !== 'string') {
          continue;
        }

        // Skip L1 transfer rules if opt-in support is not enabled
        if ((rule.category === 'L1-AR' || rule.category === 'L1-FR') && !config.enableL1Support) {
          continue;
        }

        try {
          const caseInsensitive = rule.match.caseInsensitive !== false;
          const flags = (caseInsensitive ? 'i' : '') + 'g';
          const regex = new RegExp(rule.match.pattern, flags);
          let match: RegExpExecArray | null;

          while ((match = regex.exec(currentText)) !== null) {
            const start = match.index;
            const end = match.index + match[0].length;
            const original = match[0];

            // Compute replacement string using template
            const singleFlags = caseInsensitive ? 'i' : undefined;
            let replacementStr = original;
            const currentMatch = match;
            if (typeof rule.replacement === 'string') {
              if (/\$(&|\d)/.test(rule.replacement)) {
                // Populate replacement template from regex match capture groups
                replacementStr = rule.replacement
                  .replace(/\$&/g, currentMatch[0])
                  .replace(/\$(\d)/g, (_, groupIndex) => {
                    const idx = parseInt(groupIndex, 10);
                    return currentMatch[idx] !== undefined ? currentMatch[idx] : `$${groupIndex}`;
                  });
              } else if (!rule.replacement.includes('$')) {
                replacementStr = rule.replacement;
              } else {
                replacementStr = original.replace(new RegExp(rule.match.pattern, singleFlags), rule.replacement);
              }
            }

            // Preserve initial uppercase if original had it and replacement is lowercase
            if (/^[A-Z]/.test(original) && /^[a-z]/.test(replacementStr)) {
              replacementStr = replacementStr.charAt(0).toUpperCase() + replacementStr.slice(1);
            }

            // Avoid zero-change matches
            if (original === replacementStr) continue;

            const candidate: CorrectionCandidate = {
              ruleId: rule.id,
              start,
              end,
              original,
              replacement: replacementStr,
              confidence: rule.confidence,
              category: rule.category,
              rationale: rule.description,
              provenance: rule.provenance,
            };

            // 4. Exception & Guard Checks
            const guardCheck = shouldGuardCandidate(
              candidate,
              rule,
              currentText,
              protectedSpans,
              config
            );

            if (guardCheck.guarded) {
              candidate.status = 'suppressed_by_guard';
              suppressedCandidates.push(candidate);
              allCandidates.push(candidate);
              continue;
            }

            // Candidate valid for scoring
            passCandidates.push(candidate);
          }
        } catch (err) {
          console.error(`Rule ${rule.id} execution failed:`, err);
        }
      }

      // 3b. Syntactic Dependency & Long-Distance Agreement Candidates
      const depCandidates = extractDependencyCandidates(currentText);
      for (const cand of depCandidates) {
        const rule = this.rules.find((r) => r.id === cand.ruleId);
        if (!rule || !rule.enabled) continue;

        const guardCheck = shouldGuardCandidate(
          cand,
          rule,
          currentText,
          protectedSpans,
          config
        );

        if (guardCheck.guarded) {
          cand.status = 'suppressed_by_guard';
          suppressedCandidates.push(cand);
          allCandidates.push(cand);
          continue;
        }

        passCandidates.push(cand);
      }

      // 3c. Systematic Multi-Clause Conditional Harmonization Candidates
      const condCandidates = analyzeConditionals(currentText);
      for (const cand of condCandidates) {
        const rule = this.rules.find((r) => r.id === cand.ruleId);
        if (!rule || !rule.enabled) continue;

        const guardCheck = shouldGuardCandidate(
          cand,
          rule,
          currentText,
          protectedSpans,
          config
        );

        if (guardCheck.guarded) {
          cand.status = 'suppressed_by_guard';
          suppressedCandidates.push(cand);
          allCandidates.push(cand);
          continue;
        }

        passCandidates.push(cand);
      }

      // 5. Candidate scoring & conflict resolution
      passCandidates.sort((a, b) => {
        const ruleA = this.rules.find((r) => r.id === a.ruleId);
        const ruleB = this.rules.find((r) => r.id === b.ruleId);
        const prioA = ruleA?.priority || 0;
        const prioB = ruleB?.priority || 0;
        if (prioB !== prioA) return prioB - prioA;
        return b.confidence - a.confidence;
      });

      // Filter out overlapping candidates
      const nonOverlappingCandidates: CorrectionCandidate[] = [];
      for (const cand of passCandidates) {
        const hasOverlap = nonOverlappingCandidates.some(
          (accepted) => Math.max(cand.start, accepted.start) < Math.min(cand.end, accepted.end)
        );

        if (!hasOverlap) {
          nonOverlappingCandidates.push(cand);
        } else {
          cand.status = 'conflict_dropped';
          suppressedCandidates.push(cand);
          allCandidates.push(cand);
        }
      }

      // 6. Application based on Engine Mode & Confidence thresholds
      const sortedToApply = [...nonOverlappingCandidates].sort((a, b) => b.start - a.start);

      for (const cand of nonOverlappingCandidates) {
        allCandidates.push(cand);

        const rule = this.rules.find((r) => r.id === cand.ruleId);
        const isEligibleAuto =
          cand.confidence >= 0.95 &&
          rule?.autoApply !== false &&
          (rule?.tier === 'tier1-local' || rule?.tier === 'tier2-syntax' || rule?.tier === undefined) &&
          rule?.action !== 'suggest' &&
          rule?.category !== 'STYLE' &&
          config.mode === 'autoApply';

        if (isEligibleAuto) {
          cand.status = 'auto_applied';
          appliedCandidates.push(cand);
        } else if (cand.confidence >= 0.90 || config.mode === 'suggest') {
          cand.status = 'suggested';
          suggestedCandidates.push(cand);
        } else {
          cand.status = 'suppressed_by_guard';
          suppressedCandidates.push(cand);
        }
      }

      if (config.mode === 'autoApply' && sortedToApply.length > 0) {
        let mutableText = currentText;
        for (const cand of sortedToApply) {
          if (cand.status === 'auto_applied') {
            mutableText =
              mutableText.slice(0, cand.start) +
              cand.replacement +
              mutableText.slice(cand.end);
            textModifiedInPass = true;
          }
        }

        // Loop / oscillation detection (EX-LOOP-001)
        if (seenStates.has(mutableText)) {
          // Detected oscillation or duplicate loop state: halt passes immediately
          console.warn('EX-LOOP-001 fired: Detected edit oscillation/loop. Halting execution pass.');
          break;
        }

        seenStates.add(mutableText);
        currentText = mutableText;
      }
    }

    const duration = performance.now() - startTime;
    const { clauses, escalations, advisories } = analyzeClausesAndDiscourse(currentText);

    return {
      originalText: inputText,
      outputText: config.mode === 'shadow' ? inputText : currentText,
      mode: config.mode,
      protectedSpans,
      candidates: allCandidates,
      appliedCandidates,
      suggestedCandidates,
      suppressedCandidates,
      sentencesCount: segmentSentences(inputText).length,
      passesExecuted,
      processingTimeMs: Math.round(duration * 100) / 100,
      hasChanged: inputText !== currentText,
      clauses,
      discourseEscalations: escalations,
      stylisticAdvisories: advisories,
    };
  }
}
