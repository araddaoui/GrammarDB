import { CorrectionCandidate, EngineMode } from '../engine/types';

/**
 * Corpus split. Each split answers a different question:
 *  - clean:      text that is already correct; ANY applied edit is over-correction
 *  - mechanical: a known, unambiguous error that a deterministic rule should fix
 *  - guard:      text containing protected content (quotes/code/urls) that must survive
 *  - parser:     needs real syntax/lexicon understanding; engine should NOT auto-apply
 */
export type CorpusSplit = 'clean' | 'mechanical' | 'guard' | 'parser';

export interface GoldEdit {
  /** Expected rule id, when known. Matching is text-first, id-second. */
  ruleId?: string;
  original: string;
  replacement: string;
  category?: string;
  /** Optional gold edits do not count as misses when absent. */
  optional?: boolean;
  note?: string;
}

export interface BenchmarkCase {
  id: string;
  split: CorpusSplit;
  input: string;
  expectedOutput: string;
  goldEdits: GoldEdit[];
  /** Substrings that must never appear in the output (guard traps). */
  forbiddenSubstrings?: string[];
  mode?: EngineMode;
  minAutoApplyConfidence?: number;
  tags?: string[];
  note?: string;
}

export interface BenchmarkCorpus {
  corpusId: string;
  version: string;
  description: string;
  cases: BenchmarkCase[];
}

export interface EditMatch {
  gold: GoldEdit;
  applied: CorrectionCandidate | null;
}

export interface CaseResult {
  caseId: string;
  split: CorpusSplit;
  mode: EngineMode;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  /** Expected edits that were satisfied by an applied or suggested edit. */
  matchedEdits: EditMatch[];
  /** Applied edits with no corresponding gold edit. */
  spuriousEdits: CorrectionCandidate[];
  /** Gold edits with no corresponding actual edit. */
  missedEdits: GoldEdit[];
  forbiddenHits: string[];
  outputExact: boolean;
  appliedCount: number;
  suggestedCount: number;
  suppressedCount: number;
  escalationCount: number;
  errorMessage?: string;
}

export interface SplitMetrics {
  split: CorpusSplit;
  cases: number;
  outputExactRate: number;
  precision: number;
  recall: number;
  f1: number;
  overcorrectionRate: number;
  cleanControlStability: number;
}

export interface BenchmarkMetrics {
  cases: number;
  inputExactRate: number;
  outputExactRate: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
  /** 1 - precision: share of applied edits that were not wanted. */
  overcorrectionRate: number;
  /** Share of clean cases left untouched (1 = perfect restraint). */
  cleanControlStability: number;
  autoApplyRate: number;
  escalationRate: number;
}

export interface BenchmarkReport {
  corpusId: string;
  corpusVersion: string;
  engineVersion: string;
  mode: EngineMode;
  minAutoApplyConfidence: number;
  generatedAt: string;
  durationMs: number;
  metrics: BenchmarkMetrics;
  perSplit: SplitMetrics[];
  results: CaseResult[];
}

/** A pluggable text transformer so any baseline can be A/B compared. */
export interface TransformerOutput {
  outputText: string;
}
export type TextTransformer = (text: string) => TransformerOutput;

export interface CaseComparison {
  caseId: string;
  gold: string;
  candidate: string;
  baseline: string;
  candidateDistance: number;
  baselineDistance: number;
  winner: 'candidate' | 'baseline' | 'tie';
  candidateExact: boolean;
  baselineExact: boolean;
}

export interface ComparisonReport {
  corpusId: string;
  cases: number;
  candidateExactRate: number;
  baselineExactRate: number;
  candidateMeanDistance: number;
  baselineMeanDistance: number;
  wins: number;
  losses: number;
  ties: number;
  winner: 'candidate' | 'baseline' | 'tie';
  comparisons: CaseComparison[];
}
