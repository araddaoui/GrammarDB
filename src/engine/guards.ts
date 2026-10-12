import { CorrectionCandidate, ProtectedSpan, Rule, EngineConfig, GrammarExceptionsSchema } from './types';
import { isRangeOverlappingProtected } from './protectedSpans';

export const OFFICIAL_GRAMMAR_EXCEPTIONS: GrammarExceptionsSchema = {
  schemaVersion: '0.1.0',
  purpose: 'Shared guards and protected-span policies applied before correction candidates can be accepted.',
  protectedSpanKinds: [
    'code',
    'url',
    'email',
    'citation',
    'reference',
    'footnote',
    'endnote',
    'superscript',
    'equation',
    'quoted-immutable',
    'user-locked',
    'proper-name-locked',
  ],
  globalGuards: [
    {
      id: 'EX-PROTECTED-001',
      condition: 'candidate overlaps any protected span',
      action: 'reject_candidate',
      reason: 'Protected content must not be changed.',
    },
    {
      id: 'EX-SEMANTIC-001',
      condition: 'candidate may alter negation, modality, tense, aspect, agency, quantifier, comparison, or scope',
      action: 'escalate',
      reason: 'Meaning-sensitive change requires contextual review.',
    },
    {
      id: 'EX-DIALECT-001',
      condition: 'source and replacement differ only by accepted dialect/style variant',
      action: 'reject_candidate',
      reason: 'Do not normalize a legitimate variety unless requested.',
    },
    {
      id: 'EX-TECH-001',
      condition: 'matched phrase appears in user glossary or domain terminology list',
      action: 'reject_candidate',
      reason: 'Respect technical and user-defined vocabulary.',
    },
    {
      id: 'EX-QUOTE-001',
      condition: 'text is quoted and quote-preservation mode is enabled',
      action: 'reject_candidate',
      reason: 'Do not silently rewrite quoted language.',
    },
    {
      id: 'EX-FRAGMENT-001',
      condition: 'text is a title, heading, bullet fragment, dialogue fragment, or deliberate creative fragment',
      action: 'escalate',
      reason: 'Sentence-level grammar assumptions may not apply.',
    },
    {
      id: 'EX-AMBIG-001',
      condition: 'two or more corrections remain plausible',
      action: 'escalate',
      reason: 'Do not guess intended meaning.',
    },
    {
      id: 'EX-LOOP-001',
      condition: 'same rule proposes the same edit twice or edits oscillate',
      action: 'stop_sentence_and_log',
      reason: 'Prevent correction loops.',
    },
  ],
  dialectNotes: [
    'Support configured English variety; do not assume US English.',
    'Store accepted variants and their contexts rather than treating frequency as correctness.',
    'Style-guide preferences are not grammar errors unless the user selects that style.',
  ],
  applicationNotes: [
    'Check guards before scoring and again immediately before applying edits.',
    'Guard outcomes should be logged without retaining raw text beyond product policy.',
    'A rule-specific guard can narrow a global guard but must not override protected-span rejection.',
  ],
};

const RHETORICAL_REPETITIONS = new Set([
  'had had',
  'that that',
  'very very',
  'no no',
  'again and again',
  'by and by',
]);

export function shouldGuardCandidate(
  cand: CorrectionCandidate,
  rule: Rule,
  fullText: string,
  protectedSpans: ProtectedSpan[],
  config: EngineConfig
): { guarded: boolean; guardId?: string; reason?: string } {
  // EX-PROTECTED-001: Protected content must not be changed (unless rule explicitly ignores protected spans e.g. conditional matrix rules)
  const ignoresProtected = rule.guards?.includes('ignore_protected_spans');
  if (!ignoresProtected && isRangeOverlappingProtected(cand.start, cand.end, protectedSpans)) {
    return {
      guarded: true,
      guardId: 'EX-PROTECTED-001',
      reason: 'Protected content must not be changed (overlaps code/URL/citation/locked span).',
    };
  }

  // EX-QUOTE-001: Quoted text guard when quote-preservation mode is active
  if (config.skipDirectQuotes && !ignoresProtected) {
    const isInsideQuote = protectedSpans.some(
      (s) => s.kind === 'quoted-immutable' && cand.start >= s.start && cand.end <= s.end
    );
    if (isInsideQuote) {
      return {
        guarded: true,
        guardId: 'EX-QUOTE-001',
        reason: 'Quoted language preserved without silent rewriting.',
      };
    }
  }

  // Rhetorical Repetition guard (for duplicate words rules)
  if (rule.id === 'SPELL-DUP-001' || rule.id === 'MECH-001') {
    const matchedLower = cand.original.toLowerCase().trim().replace(/\s+/g, ' ');
    if (RHETORICAL_REPETITIONS.has(matchedLower)) {
      return {
        guarded: true,
        guardId: 'EX-SEMANTIC-001',
        reason: `Rhetorical or grammatical valid repetition: '${matchedLower}'.`,
      };
    }
  }

  // Modal governance & inversion guard for pronoun-verb agreement (AGR-PRON rules)
  if (rule.category === 'AGR' && rule.id.startsWith('AGR-PRON')) {
    const textBefore = fullText.slice(0, cand.start).trimEnd();
    const precedingMatch = textBefore.match(/\b([A-Za-z]+)\s*$/);
    if (precedingMatch) {
      const precedingWord = precedingMatch[1].toLowerCase();
      const MODAL_AUXILIARIES = new Set([
        'can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would',
        'did', 'do', 'does'
      ]);
      if (MODAL_AUXILIARIES.has(precedingWord)) {
        return {
          guarded: true,
          guardId: 'EX-SEMANTIC-001',
          reason: `Modal auxiliary or inversion governance precedes pronoun: '${precedingWord}'.`,
        };
      }
    }

    // Mandative subjunctive guard: "demanded that he have", "suggested that she have"
    const broaderContextBefore = fullText.slice(Math.max(0, cand.start - 60), cand.start);
    if (/\b(?:demand|insist|require|recommend|suggest|request|ask|prefer|order|urge|command)(?:ed|s|ing)?\s+that\s*$/i.test(broaderContextBefore)) {
      return {
        guarded: true,
        guardId: 'EX-SEMANTIC-001',
        reason: 'Mandative subjunctive clause requires base infinitive form.',
      };
    }
  }

  // Transitive preposition complementation guard (e.g. "discussion about")
  if (rule.id === 'PREP-TRANS-001') {
    const textBefore = fullText.slice(Math.max(0, cand.start - 30), cand.start);
    if (/\b(?:a|an|the|this|that|their|our|his|her|its|have|had|having)\s+$/i.test(textBefore)) {
      return {
        guarded: true,
        guardId: 'EX-SEMANTIC-001',
        reason: "Nominal complementation pattern ('discussion about') preserved.",
      };
    }
  }

  // EX-DIALECT-001: Dialect variant preservation
  if (config.dialect && config.dialect !== 'neutral') {
    // Preserve configured variety
  }

  // Rule enabled status guard
  if (!rule.enabled) {
    return {
      guarded: true,
      reason: `Rule ${rule.id} is explicitly disabled (requires unavailable parser capabilities: ${rule.requires?.join(', ') || 'unspecified'}).`,
    };
  }

  return { guarded: false };
}
