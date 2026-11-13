import {
  BenchmarkMetrics,
  CaseResult,
  CorpusSplit,
  SplitMetrics,
} from './types';

const SPLITS: CorpusSplit[] = ['clean', 'mechanical', 'guard', 'parser'];

function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function round(value: number, dp = 4): number {
  const f = Math.pow(10, dp);
  return Math.round(value * f) / f;
}

export function aggregateMetrics(results: CaseResult[]): BenchmarkMetrics {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let exact = 0;
  let inputExact = 0;
  let clean = 0;
  let cleanUntouched = 0;
  let applied = 0;
  let suggested = 0;
  let suppressed = 0;
  let escalations = 0;

  for (const r of results) {
    tp += r.truePositives;
    fp += r.falsePositives;
    fn += r.falseNegatives;
    if (r.outputExact) exact++;
    if (r.input === r.expectedOutput) inputExact++;
    if (r.split === 'clean') {
      clean++;
      if (r.appliedCount === 0) cleanUntouched++;
    }
    applied += r.appliedCount;
    suggested += r.suggestedCount;
    suppressed += r.suppressedCount;
    escalations += r.escalationCount;
  }

  // When a split has no positive signal at all (no gold edits and no actual
  // edits), precision/recall are vacuously perfect rather than zero. Zero
  // denominators should read "nothing to get wrong", not "failed".
  const precision = tp + fp === 0 ? 1 : safeDivide(tp, tp + fp);
  const recall = tp + fn === 0 ? 1 : safeDivide(tp, tp + fn);
  const f1 = precision + recall === 0 ? 0 : safeDivide(2 * precision * recall, precision + recall);

  return {
    cases: results.length,
    inputExactRate: round(safeDivide(inputExact, results.length)),
    outputExactRate: round(safeDivide(exact, results.length)),
    truePositives: tp,
    falsePositives: fp,
    falseNegatives: fn,
    precision: round(precision),
    recall: round(recall),
    f1: round(f1),
    overcorrectionRate: round(1 - precision),
    cleanControlStability: round(safeDivide(cleanUntouched, clean)),
    autoApplyRate: round(safeDivide(applied, applied + suggested + suppressed)),
    escalationRate: round(safeDivide(escalations, results.length)),
  };
}

export function splitMetrics(results: CaseResult[]): SplitMetrics[] {
  return SPLITS.filter((split) => results.some((r) => r.split === split)).map((split) => {
    const subset = results.filter((r) => r.split === split);
    const m = aggregateMetrics(subset);
    return {
      split,
      cases: subset.length,
      outputExactRate: m.outputExactRate,
      precision: m.precision,
      recall: m.recall,
      f1: m.f1,
      overcorrectionRate: m.overcorrectionRate,
      cleanControlStability: m.cleanControlStability,
    };
  });
}

/** Character-level Levenshtein distance, used for closeness-to-gold scoring. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = new Array<number>(b.length + 1);
  let curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    const swap = prev;
    prev = curr;
    curr = swap;
  }
  return prev[b.length];
}
