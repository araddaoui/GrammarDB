export interface ProtectedSpan {
  start: number;
  end: number;
  kind: string; // 'url' | 'email' | 'inline_code' | 'fenced_code' | 'citation_key' | 'math_equation' | 'user_locked' | 'quote'
  matchedText?: string;
}

export interface Token {
  text: string;
  start: number;
  end: number;
  lower: string;
  pos?: string;
  lemma?: string;
  features?: Record<string, string>;
}

export interface CorrectionCandidate {
  ruleId: string;
  start: number;
  end: number;
  original: string;
  replacement: string;
  confidence: number;
  category: string;
  rationale: string;
  requiresContext?: boolean;
  provenance?: string;
  status?: 'auto_applied' | 'suggested' | 'suppressed_by_guard' | 'conflict_dropped';
}

export interface RuleMatch {
  type:
    | 'regex'
    | 'token_pattern'
    | 'dependency_pattern'
    | 'contextual_lexical_pattern'
    | 'lexical_frame'
    | 'morphosyntactic_pattern'
    | 'same_as_rule';
  pattern?: string | string[];
  caseInsensitive?: boolean;
  subjectHead?: string;
  verb?: string;
  relation?: string;
  clauseType?: string;
  requiresDeterminerEvidence?: boolean;
  frame?: string;
  lexiconKey?: string;
  tag?: string;
  ruleId?: string;
}

export type RuleReplacement =
  | string
  | {
      type: string;
      target?: string;
      features?: Record<string, any>;
      source?: string;
      ruleId?: string;
      featuresFrom?: string;
    };

export type RuleTier = 'tier1-local' | 'tier2-syntax' | 'tier3-discourse';

export interface Rule {
  id: string;
  category: string;
  tier?: RuleTier;
  severity?: 'minor' | 'medium' | 'high';
  priority: number;
  description: string;
  match: RuleMatch;
  replacement: RuleReplacement;
  confidence: number;
  autoApply: boolean;
  enabled: boolean;
  action?: 'auto_apply' | 'suggest' | 'escalate_to_ai' | 'ask_author';
  requires: string[];
  guards: string[];
  provenance?: string;
  rationale?: string;
  examples?: {
    positive: Array<{ input: string; expected: string; note?: string }>;
    negative: Array<{ input: string; expected: string; note?: string }>;
  };
}

export interface ClauseSpan {
  clauseId: string;
  text: string;
  type: 'matrix' | 'subordinate' | 'adverbial' | 'relative' | 'coordinate';
  subordinator?: string;
  start: number;
  end: number;
  subject?: {
    text: string;
    number: 'singular' | 'plural';
    person: '1st' | '2nd' | '3rd';
    isPronoun: boolean;
    gender?: 'masculine' | 'feminine' | 'neuter' | 'unknown';
  };
  verb?: {
    text: string;
    tense: 'past' | 'present' | 'future' | 'present_perfect' | 'past_perfect' | 'modal';
    aspect: 'simple' | 'continuous' | 'perfect' | 'perfect_continuous';
    isPassive?: boolean;
  };
}

export interface DiscourseEscalationCandidate {
  id: string;
  sentenceText: string;
  matrixClause: ClauseSpan;
  subordinateClause: ClauseSpan;
  trigger: 'anaphoric_reference_mismatch' | 'cross_clause_tense_discordance' | 'collective_noun_ambiguity';
  pronoun: string;
  potentialAntecedent: string;
  hypotheses: Array<{
    id: string;
    label: string;
    revisedSentence: string;
    explanation: string;
    confidence: number;
  }>;
  aiPromptPayload: {
    sentence: string;
    context: string;
    anaphor: string;
    antecedentCandidate: string;
    question: string;
  };
  status: 'escalate_to_ai' | 'requires_author_confirmation';
}

export interface GrammarRulesSchema {
  schemaVersion: string;
  language: string;
  purpose: string;
  defaults: {
    autoApply: boolean;
    minAutoApplyConfidence: number;
    dialect: string;
  };
  rules: Rule[];
}

export interface GlobalGuard {
  id: string;
  condition: string;
  action: 'reject_candidate' | 'escalate' | 'stop_sentence_and_log';
  reason: string;
}

export interface GrammarExceptionsSchema {
  schemaVersion: string;
  purpose: string;
  protectedSpanKinds: string[];
  globalGuards: GlobalGuard[];
  dialectNotes: string[];
  applicationNotes: string[];
}

export type EngineMode = 'autoApply' | 'suggest' | 'shadow';

export interface EngineConfig {
  mode: EngineMode;
  dialect?: 'US' | 'UK' | 'neutral';
  enableL1Support?: boolean;
  skipDirectQuotes?: boolean;
  maxPasses?: number;
}

export interface StylisticAdvisory {
  id: string;
  ruleId: string;
  text: string;
  start: number;
  end: number;
  kind: 'dangling_modifier' | 'agency_mismatch' | 'passive_voice';
  originalSentence: string;
  explanation: string;
  suggestions: string[];
  severity: 'suggestion' | 'warning';
}

export interface EngineResult {
  originalText: string;
  outputText: string;
  mode: EngineMode;
  protectedSpans: ProtectedSpan[];
  candidates: CorrectionCandidate[];
  appliedCandidates: CorrectionCandidate[];
  suggestedCandidates: CorrectionCandidate[];
  suppressedCandidates: CorrectionCandidate[];
  sentencesCount: number;
  passesExecuted: number;
  processingTimeMs: number;
  hasChanged: boolean;
  clauses?: ClauseSpan[];
  discourseEscalations?: DiscourseEscalationCandidate[];
  stylisticAdvisories?: StylisticAdvisory[];
}

export interface TestCase {
  id: string;
  ruleId: string;
  input: string;
  expected: string;
  mode: string;
  status:
    | 'seed-mechanical'
    | 'guard'
    | 'negative-control'
    | 'requires-parser'
    | 'ambiguity-guard'
    | 'context-required'
    | 'lexical-frame'
    | 'dialect-guard'
    | 'loop-guard';
}

export interface GrammarTestSuiteSchema {
  schemaVersion: string;
  suiteName: string;
  note: string;
  cases: TestCase[];
}

export interface TestSuiteResult {
  total: number;
  passed: number;
  failed: number;
  precision: number;
  recall: number;
  falsePositiveRate: number;
  autoSafeRate: number;
  averageLatencyMs: number;
  details: {
    caseId: string;
    status: string;
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
    actualRules: string[];
    expectedRule: string;
    errorMessage?: string;
  }[];
}
