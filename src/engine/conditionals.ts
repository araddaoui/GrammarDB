import { CorrectionCandidate, Rule } from './types';
import { segmentSentences } from './segmenter';
import { IRREGULAR_VERBS } from '../data/irregularVerbs';

// Map of irregular verbs for accurate third conditional participle synthesis
const IRREGULAR_V3_MAP = new Map<string, string>();
for (const v of IRREGULAR_VERBS) {
  IRREGULAR_V3_MAP.set(v.v1.toLowerCase(), v.v3.toLowerCase());
}

/**
 * Converts a base verb to its past participle (V3) form.
 */
export function toPastParticiple(verb: string): string {
  const lower = verb.toLowerCase();
  if (IRREGULAR_V3_MAP.has(lower)) {
    return IRREGULAR_V3_MAP.get(lower)!;
  }
  if (lower.endsWith('e')) {
    return lower + 'd';
  }
  if (/[bcdfghjklmnpqrstvwxyz]y$/.test(lower)) {
    return lower.slice(0, -1) + 'ied';
  }
  // Double final consonant for single-syllable or stressed short vowel CVC
  if (
    /[aeiou][bcdfghjklmnpqrstvz]$/.test(lower) &&
    !/[aeiou]{2}[bcdfghjklmnpqrstvz]$/.test(lower)
  ) {
    const len = lower.length;
    if (len <= 4 || /(fer|cur|mit|fit|pel|bar|ban|tap|drop|wrap|plan|stop|scan|occur)$/.test(lower)) {
      return lower + lower.charAt(len - 1) + 'ed';
    }
  }
  return lower + 'ed';
}

/**
 * Temporal markers signaling a present outcome in apodosis
 */
const PRESENT_OUTCOME_MARKERS = /\b(today|now|currently|at present|this year|nowadays|these days|at the moment|presently|right now)\b/i;

/**
 * Temporal markers signaling completed past outcome in apodosis
 */
const PAST_OUTCOME_MARKERS = /\b(yesterday|last year|last month|last week|back then|at that time|previously|earlier|then)\b/i;

/**
 * Common past participle forms for protasis detection
 */
const PAST_PARTICIPLE_PATTERN =
  '(?:\\w+ed|\\w+en|\\w+t|been|done|gone|seen|taken|found|known|had|come|become|invested|dropped|bought|made|thought|written|built|paid|chosen|spoken|met|sent|left|kept|given|lost|brought|felt|broken|heard|caught|run|won)';

export const CONDITIONAL_RULES: Rule[] = [
  {
    id: 'COND-MIX-PAST-PRES-001',
    category: 'COND',
    tier: 'tier2-syntax',
    priority: 96,
    description: "Harmonize future modal 'will' to conditional 'would' in apodosis referencing present outcome of past counterfactual condition.",
    match: { type: 'dependency_pattern' },
    replacement: 'would',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['conditional-matrix-analyzer'],
    guards: ['ignore_protected_spans'],
    provenance: 'Layer 1 Systematic Conditional Harmonizer: Mixed Conditional (Past Condition -> Present Consequence).',
  },
  {
    id: 'COND-MIX-PAST-PRES-002',
    category: 'COND',
    tier: 'tier2-syntax',
    priority: 96,
    description: "Harmonize modal 'can' to 'could' in apodosis referencing present outcome of past counterfactual condition.",
    match: { type: 'dependency_pattern' },
    replacement: 'could',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['conditional-matrix-analyzer'],
    guards: ['ignore_protected_spans'],
    provenance: 'Layer 1 Systematic Conditional Harmonizer: Mixed Conditional (Past Condition -> Present Consequence).',
  },
  {
    id: 'COND-MIX-PAST-PRES-003',
    category: 'COND',
    tier: 'tier2-syntax',
    priority: 96,
    description: "Harmonize modal 'may' to 'might' in apodosis referencing present outcome of past counterfactual condition.",
    match: { type: 'dependency_pattern' },
    replacement: 'might',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['conditional-matrix-analyzer'],
    guards: ['ignore_protected_spans'],
    provenance: 'Layer 1 Systematic Conditional Harmonizer: Mixed Conditional (Past Condition -> Present Consequence).',
  },
  {
    id: 'COND-3RD-APODOSIS-001',
    category: 'COND',
    tier: 'tier2-syntax',
    priority: 96,
    description: "Harmonize future modal 'will' to 'would have + past participle' in third conditional counterfactual past apodosis.",
    match: { type: 'dependency_pattern' },
    replacement: 'would have',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['conditional-matrix-analyzer'],
    guards: ['ignore_protected_spans'],
    provenance: 'Layer 1 Systematic Conditional Harmonizer: Third Conditional (Past Counterfactual Matrix).',
  },
  {
    id: 'COND-3RD-WILLHAVE-001',
    category: 'COND',
    tier: 'tier2-syntax',
    priority: 96,
    description: "Harmonize 'will have' to 'would have' in third conditional counterfactual past apodosis.",
    match: { type: 'dependency_pattern' },
    replacement: 'would have',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['conditional-matrix-analyzer'],
    guards: ['ignore_protected_spans'],
    provenance: 'Layer 1 Systematic Conditional Harmonizer: Third Conditional (Past Counterfactual Matrix).',
  },
  {
    id: 'COND-2ND-APODOSIS-001',
    category: 'COND',
    tier: 'tier2-syntax',
    priority: 96,
    description: "Harmonize future modal 'will' to 'would' in second conditional hypothetical apodosis.",
    match: { type: 'dependency_pattern' },
    replacement: 'would',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['conditional-matrix-analyzer'],
    guards: ['ignore_protected_spans'],
    provenance: 'Layer 1 Systematic Conditional Harmonizer: Second Conditional (Hypothetical Present Matrix).',
  },
  {
    id: 'COND-2ND-CAN-001',
    category: 'COND',
    tier: 'tier2-syntax',
    priority: 96,
    description: "Harmonize modal 'can' to 'could' in second conditional hypothetical apodosis.",
    match: { type: 'dependency_pattern' },
    replacement: 'could',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['conditional-matrix-analyzer'],
    guards: ['ignore_protected_spans'],
    provenance: 'Layer 1 Systematic Conditional Harmonizer: Second Conditional (Hypothetical Present Matrix).',
  },
  {
    id: 'COND-1ST-PROT-WILL-001',
    category: 'COND',
    tier: 'tier2-syntax',
    priority: 96,
    description: "Remove erroneous future modal 'will' from first conditional protasis.",
    match: { type: 'dependency_pattern' },
    replacement: '',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['conditional-matrix-analyzer'],
    guards: ['ignore_protected_spans'],
    provenance: 'Layer 1 Systematic Conditional Harmonizer: First Conditional (Protasis Present Frame).',
  },
];

interface ClauseInfo {
  protasisText: string;
  protasisOffset: number;
  apodosisText: string;
  apodosisOffset: number;
  topology: 'standard' | 'reverse' | 'inverted';
}

/**
 * Extracts protasis and apodosis clauses across standard, reverse, and inverted sentence topologies,
 * seamlessly handling leading/enclosing quotation marks, dialogue attributions, and conjunction separators.
 */
function extractConditionalClauses(sentenceText: string, sentenceOffset: number): ClauseInfo | null {
  // 1. Inverted Conditional: starts with optional quotes, then "Had [subject] [participle]..." or "Were [subject]..."
  const invertedMatch = sentenceText.match(
    /^[\s"'“‘«„(\[]*(Had|Were)\s+([A-Za-z0-9\s'-]{1,40}?)\s+(?:not\s+)?(?:never\s+)?(?:already\s+)?([A-Za-z]+)\b/i
  );
  if (invertedMatch) {
    const commaIndex = sentenceText.indexOf(',');
    if (commaIndex !== -1) {
      return {
        protasisText: sentenceText.slice(0, commaIndex),
        protasisOffset: sentenceOffset,
        apodosisText: sentenceText.slice(commaIndex + 1),
        apodosisOffset: sentenceOffset + commaIndex + 1,
        topology: 'inverted',
      };
    }
  }

  // 2. Standard Conditional: starts with optional quotes / punct, then If, Unless, Provided that, etc.
  const standardMatch = sentenceText.match(
    /^[\s"'“‘«„(\[]*(if|unless|provided\s+that|providing\s+that|as\s+long\s+as|so\s+long\s+as|even\s+if|on\s+condition\s+that|supposing\s+that|assuming\s+that)\b/i
  );
  if (standardMatch) {
    const commaIndex = sentenceText.indexOf(',');
    if (commaIndex !== -1) {
      return {
        protasisText: sentenceText.slice(0, commaIndex),
        protasisOffset: sentenceOffset,
        apodosisText: sentenceText.slice(commaIndex + 1),
        apodosisOffset: sentenceOffset + commaIndex + 1,
        topology: 'standard',
      };
    }

    const thenMatch = sentenceText.match(/\bthen\b/i);
    if (thenMatch && thenMatch.index) {
      return {
        protasisText: sentenceText.slice(0, thenMatch.index),
        protasisOffset: sentenceOffset,
        apodosisText: sentenceText.slice(thenMatch.index + 4),
        apodosisOffset: sentenceOffset + thenMatch.index + 4,
        topology: 'standard',
      };
    }
  }

  // 3. Embedded / Quoted conditional inside a sentence (e.g. Note: "If the government...", He said, "If...")
  const embeddedMatch = sentenceText.match(
    /[:,\"'\s“‘]\s*[\"'“‘]?\s*(if|unless|even\s+if|provided\s+that|had|were)\b/i
  );
  if (embeddedMatch && embeddedMatch.index !== undefined) {
    const subWord = embeddedMatch[1];
    const ifPos = embeddedMatch.index + embeddedMatch[0].toLowerCase().lastIndexOf(subWord.toLowerCase());
    const afterIf = sentenceText.slice(ifPos);
    const commaIndex = afterIf.indexOf(',');
    if (commaIndex !== -1) {
      return {
        protasisText: afterIf.slice(0, commaIndex),
        protasisOffset: sentenceOffset + ifPos,
        apodosisText: afterIf.slice(commaIndex + 1),
        apodosisOffset: sentenceOffset + ifPos + commaIndex + 1,
        topology: 'standard',
      };
    }
  }

  // 4. Reverse Conditional: Apodosis first, followed by subordinator and Protasis
  // e.g. "Pollution levels will drop today if the government had invested more money last year."
  const reverseMatch = sentenceText.match(
    /\b(if|unless|provided\s+that|providing\s+that|as\s+long\s+as|even\s+if)\b/i
  );
  if (reverseMatch && reverseMatch.index !== undefined && reverseMatch.index > 5) {
    return {
      apodosisText: sentenceText.slice(0, reverseMatch.index),
      apodosisOffset: sentenceOffset,
      protasisText: sentenceText.slice(reverseMatch.index),
      protasisOffset: sentenceOffset + reverseMatch.index,
      topology: 'reverse',
    };
  }

  return null;
}

/**
 * Analyzes conditional sentences across the board and generates deterministic
 * Layer 1 CorrectionCandidate records with exact character coordinates.
 */
export function analyzeConditionals(fullText: string): CorrectionCandidate[] {
  const candidates: CorrectionCandidate[] = [];
  const sentences = segmentSentences(fullText);

  for (const sentence of sentences) {
    const clauseInfo = extractConditionalClauses(sentence.text, sentence.start);
    if (!clauseInfo) continue;

    const { protasisText, apodosisText, apodosisOffset } = clauseInfo;

    // Detect Protasis Mood & Tense
    const hasHadParticiple = new RegExp(
      `\\bhad\\s+(?:not\\s+)?(?:never\\s+)?(?:already\\s+)?${PAST_PARTICIPLE_PATTERN}\\b`,
      'i'
    ).test(protasisText);

    const isInvertedHad = /^[\s"'“‘«„(\[]*Had\s+/i.test(protasisText);
    const hasPastCounterfactualProtasis =
      hasHadParticiple ||
      isInvertedHad ||
      /\bwould\s+(?:have\s+\w+|invest|act|take|do|make)\b.*?(?:last\s+year|yesterday|previously)/i.test(
        protasisText
      );

    const hasHypotheticalPresentProtasis =
      !hasPastCounterfactualProtasis &&
      (/\b(?:were|was|were\s+to\s+\w+)\b/i.test(protasisText) ||
        /^[\s"'“‘«„(\[]*Were\s+/i.test(protasisText) ||
        /\b(?:knew|took|saw|went|won|started|wanted|could|spoke|chose|bought|brought|came|did|felt|found|gave|heard|kept|left|lost|made|met|paid|ran|said|sat|sent|stood|thought|understood|wrote)\b/i.test(protasisText) ||
        /\b[a-z]{3,}ed\b/i.test(protasisText) ||
        /\bhad\s+(?:a|an|the|more|less|enough|any|[a-z]+)\b/i.test(protasisText));

    // Detect Temporal Markers across apodosis and sentence context
    const hasPresentOutcomeMarker =
      PRESENT_OUTCOME_MARKERS.test(apodosisText) || PRESENT_OUTCOME_MARKERS.test(sentence.text);
    const hasPastOutcomeMarker =
      PAST_OUTCOME_MARKERS.test(apodosisText) || PAST_OUTCOME_MARKERS.test(sentence.text);

    // Look for modal auxiliary in apodosis
    // Matches "will drop", "will significantly drop", "will not drop", "can drop", "may drop", "will have dropped"
    const modalVerbRegex =
      /\b(will\s+have|will|can|may|shall)\s+((?:not\s+|never\s+)?)(?:also\s+)?((?:[a-z]{3,}ly|also|even|still|already|soon)\s+)?([a-z]+)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = modalVerbRegex.exec(apodosisText)) !== null) {
      const fullMatch = match[0];
      const modal = match[1].toLowerCase();
      const negation = match[2] || '';
      const adverb = match[3] || '';
      const mainVerb = match[4];
      const modifier = `${negation}${adverb}`;

      const matchStartInApodosis = match.index;
      const absStart = apodosisOffset + matchStartInApodosis;
      const absEnd = absStart + fullMatch.length;

      // Preserve casing if modal was capitalized
      const isCapitalized = /^[A-Z]/.test(fullMatch);
      const applyCase = (s: string) =>
        isCapitalized ? s.charAt(0).toUpperCase() + s.slice(1) : s;

      // ---------------------------------------------------------
      // SCENARIO 1: Past Counterfactual + Present Outcome -> Mixed Conditional
      // ---------------------------------------------------------
      if (hasPastCounterfactualProtasis && hasPresentOutcomeMarker) {
        if (modal === 'will' || modal === 'shall') {
          candidates.push({
            ruleId: 'COND-MIX-PAST-PRES-001',
            start: absStart,
            end: absEnd,
            original: fullMatch,
            replacement: applyCase(`would ${modifier}${mainVerb}`),
            confidence: 0.985,
            category: 'COND',
            rationale:
              "Mixed conditional: Past counterfactual condition with present outcome marker requires conditional modal 'would' in the apodosis.",
            provenance: 'Layer 1 Systematic Conditional Harmonizer: Mixed (Past -> Present)',
          });
        } else if (modal === 'can') {
          candidates.push({
            ruleId: 'COND-MIX-PAST-PRES-002',
            start: absStart,
            end: absEnd,
            original: fullMatch,
            replacement: applyCase(`could ${modifier}${mainVerb}`),
            confidence: 0.985,
            category: 'COND',
            rationale:
              "Mixed conditional: Past counterfactual condition requires conditional modal 'could' in the apodosis.",
            provenance: 'Layer 1 Systematic Conditional Harmonizer: Mixed (Past -> Present)',
          });
        } else if (modal === 'may') {
          candidates.push({
            ruleId: 'COND-MIX-PAST-PRES-003',
            start: absStart,
            end: absEnd,
            original: fullMatch,
            replacement: applyCase(`might ${modifier}${mainVerb}`),
            confidence: 0.985,
            category: 'COND',
            rationale:
              "Mixed conditional: Past counterfactual condition requires conditional modal 'might' in the apodosis.",
            provenance: 'Layer 1 Systematic Conditional Harmonizer: Mixed (Past -> Present)',
          });
        }
      }

      // ---------------------------------------------------------
      // SCENARIO 2: Past Counterfactual + Past/General Outcome -> Third Conditional
      // ---------------------------------------------------------
      else if (hasPastCounterfactualProtasis && !hasPresentOutcomeMarker) {
        if (modal === 'will have') {
          candidates.push({
            ruleId: 'COND-3RD-WILLHAVE-001',
            start: absStart,
            end: absEnd,
            original: fullMatch,
            replacement: applyCase(`would have ${modifier}${mainVerb}`),
            confidence: 0.985,
            category: 'COND',
            rationale:
              "Third conditional: Counterfactual past condition requires 'would have' rather than future 'will have'.",
            provenance: 'Layer 1 Systematic Conditional Harmonizer: Third Conditional Matrix',
          });
        } else if (modal === 'will' || modal === 'shall') {
          const v3 = toPastParticiple(mainVerb);
          candidates.push({
            ruleId: 'COND-3RD-APODOSIS-001',
            start: absStart,
            end: absEnd,
            original: fullMatch,
            replacement: applyCase(`would have ${modifier}${v3}`),
            confidence: 0.985,
            category: 'COND',
            rationale:
              "Third conditional: Counterfactual past condition requires 'would have + past participle' in the apodosis.",
            provenance: 'Layer 1 Systematic Conditional Harmonizer: Third Conditional Matrix',
          });
        }
      }

      // ---------------------------------------------------------
      // SCENARIO 3: Hypothetical Present -> Second Conditional
      // ---------------------------------------------------------
      else if (hasHypotheticalPresentProtasis) {
        if (modal === 'will' || modal === 'shall') {
          candidates.push({
            ruleId: 'COND-2ND-APODOSIS-001',
            start: absStart,
            end: absEnd,
            original: fullMatch,
            replacement: applyCase(`would ${modifier}${mainVerb}`),
            confidence: 0.985,
            category: 'COND',
            rationale:
              "Second conditional: Hypothetical or unreal condition requires conditional modal 'would' in the apodosis.",
            provenance: 'Layer 1 Systematic Conditional Harmonizer: Second Conditional Matrix',
          });
        } else if (modal === 'can') {
          candidates.push({
            ruleId: 'COND-2ND-CAN-001',
            start: absStart,
            end: absEnd,
            original: fullMatch,
            replacement: applyCase(`could ${modifier}${mainVerb}`),
            confidence: 0.985,
            category: 'COND',
            rationale:
              "Second conditional: Hypothetical condition requires conditional modal 'could' in the apodosis.",
            provenance: 'Layer 1 Systematic Conditional Harmonizer: Second Conditional Matrix',
          });
        }
      }
    }
  }

  return candidates;
}
