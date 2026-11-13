import { IdiomOptimaEngine } from '../engine/engine';
import { CorrectionCandidate, EngineMode } from '../engine/types';
import { aggregateMetrics, levenshtein, splitMetrics } from './metrics';
import {
  BenchmarkCase,
  BenchmarkCorpus,
  BenchmarkReport,
  CaseComparison,
  CaseResult,
  ComparisonReport,
  EditMatch,
  GoldEdit,
  TextTransformer,
} from './types';

export const BENCHMARK_ENGINE_VERSION = '0.2.0';

export interface RunOptions {
  mode?: EngineMode;
  minAutoApplyConfidence?: number;
  maxPasses?: number;
  now?: () => Date;
}

function actualEditsFor(result: { appliedCandidates: CorrectionCandidate[]; suggestedCandidates: CorrectionCandidate[] }, mode: EngineMode): CorrectionCandidate[] {
  if (mode === 'suggest') return result.suggestedCandidates;
  return result.appliedCandidates;
}

function matchEdits(gold: GoldEdit[], actual: CorrectionCandidate[]): {
  matched: EditMatch[];
  spurious: CorrectionCandidate[];
  missed: GoldEdit[];
  tp: number;
  fp: number;
  fn: number;
} {
  const used = new Set<number>();
  const matched: EditMatch[] = [];

  for (const g of gold) {
    let foundIdx = -1;
    for (let i = 0; i < actual.length; i++) {
      if (used.has(i)) continue;
      const a = actual[i];
      const sameText = a.original === g.original && a.replacement === g.replacement;
      const sameRule = g.ruleId !== undefined && a.ruleId === g.ruleId && a.replacement === g.replacement;
      if (sameText || sameRule) {
        foundIdx = i;
        break;
      }
    }
    if (foundIdx >= 0) {
      used.add(foundIdx);
      matched.push({ gold: g, applied: actual[foundIdx] });
    } else {
      matched.push({ gold: g, applied: null });
    }
  }

  const spurious = actual.filter((_, i) => !used.has(i));
  const missed = matched.filter((m) => m.applied === null && !m.gold.optional).map((m) => m.gold);
  const tp = matched.filter((m) => m.applied !== null).length;
  const fn = missed.length;
  const fp = spurious.length;

  return { matched, spurious, missed, tp, fp, fn };
}

function runCase(engine: IdiomOptimaEngine, c: BenchmarkCase, options: RunOptions): CaseResult {
  const mode: EngineMode = c.mode ?? options.mode ?? 'autoApply';
  const config = {
    mode,
    minAutoApplyConfidence: c.minAutoApplyConfidence ?? options.minAutoApplyConfidence,
    maxPasses: options.maxPasses,
  };

  const result = engine.process(c.input, config);
  const actual = actualEditsFor(result, mode);
  const gold = c.goldEdits ?? [];
  const { matched, spurious, missed, tp, fp, fn } = matchEdits(gold, actual);

  const forbiddenHits = (c.forbiddenSubstrings ?? []).filter((s) => result.outputText.includes(s));
  const outputExact = result.outputText === c.expectedOutput;

  return {
    caseId: c.id,
    split: c.split,
    mode,
    passed: outputExact && forbiddenHits.length === 0,
    input: c.input,
    expectedOutput: c.expectedOutput,
    actualOutput: result.outputText,
    truePositives: tp,
    falsePositives: fp,
    falseNegatives: fn,
    matchedEdits: matched,
    spuriousEdits: spurious,
    missedEdits: missed,
    forbiddenHits,
    outputExact,
    appliedCount: result.appliedCandidates.length,
    suggestedCount: result.suggestedCandidates.length,
    suppressedCount: result.suppressedCandidates.length,
    escalationCount: result.discourseEscalations?.length ?? 0,
  };
}

export function runBenchmark(
  engine: IdiomOptimaEngine,
  corpus: BenchmarkCorpus,
  options: RunOptions = {}
): BenchmarkReport {
  const startedAt = performance.now();
  const results = corpus.cases.map((c) => runCase(engine, c, options));
  const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
  const mode: EngineMode = options.mode ?? 'autoApply';
  const generatedAt = (options.now ?? (() => new Date()))().toISOString();

  return {
    corpusId: corpus.corpusId,
    corpusVersion: corpus.version,
    engineVersion: BENCHMARK_ENGINE_VERSION,
    mode,
    minAutoApplyConfidence: options.minAutoApplyConfidence ?? 0.95,
    generatedAt,
    durationMs,
    metrics: aggregateMetrics(results),
    perSplit: splitMetrics(results),
    results,
  };
}

export function compareTransformers(
  corpus: BenchmarkCorpus,
  candidate: TextTransformer,
  baseline: TextTransformer
): ComparisonReport {
  const comparisons: CaseComparison[] = [];
  let wins = 0;
  let losses = 0;
  let ties = 0;
  let candidateExact = 0;
  let baselineExact = 0;
  let candidateDistance = 0;
  let baselineDistance = 0;

  for (const c of corpus.cases) {
    const cand = candidate(c.input).outputText;
    const base = baseline(c.input).outputText;
    const candDist = levenshtein(cand, c.expectedOutput);
    const baseDist = levenshtein(base, c.expectedOutput);
    const candExact = cand === c.expectedOutput;
    const baseExact = base === c.expectedOutput;

    let winner: CaseComparison['winner'] = 'tie';
    if (candDist < baseDist) {
      winner = 'candidate';
      wins++;
    } else if (baseDist < candDist) {
      winner = 'baseline';
      losses++;
    } else {
      ties++;
    }

    if (candExact) candidateExact++;
    if (baseExact) baselineExact++;
    candidateDistance += candDist;
    baselineDistance += baseDist;

    comparisons.push({
      caseId: c.id,
      gold: c.expectedOutput,
      candidate: cand,
      baseline: base,
      candidateDistance: candDist,
      baselineDistance: baseDist,
      winner,
      candidateExact: candExact,
      baselineExact: baseExact,
    });
  }

  const n = corpus.cases.length || 1;
  return {
    corpusId: corpus.corpusId,
    cases: corpus.cases.length,
    candidateExactRate: Math.round((candidateExact / n) * 10000) / 10000,
    baselineExactRate: Math.round((baselineExact / n) * 10000) / 10000,
    candidateMeanDistance: Math.round((candidateDistance / n) * 100) / 100,
    baselineMeanDistance: Math.round((baselineDistance / n) * 100) / 100,
    wins,
    losses,
    ties,
    winner: wins > losses ? 'candidate' : losses > wins ? 'baseline' : 'tie',
    comparisons,
  };
}
