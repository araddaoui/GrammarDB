import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { aggregateMetrics, levenshtein } from '../metrics';
import { CaseResult } from '../types';

function caseResult(overrides: Partial<CaseResult>): CaseResult {
  return {
    caseId: 'x',
    split: 'mechanical',
    mode: 'autoApply',
    passed: true,
    input: '',
    expectedOutput: '',
    actualOutput: '',
    truePositives: 0,
    falsePositives: 0,
    falseNegatives: 0,
    matchedEdits: [],
    spuriousEdits: [],
    missedEdits: [],
    forbiddenHits: [],
    outputExact: true,
    appliedCount: 0,
    suggestedCount: 0,
    suppressedCount: 0,
    escalationCount: 0,
    ...overrides,
  };
}

test('levenshtein distance basics', () => {
  assert.equal(levenshtein('kitten', 'sitting'), 3);
  assert.equal(levenshtein('same', 'same'), 0);
  assert.equal(levenshtein('', 'abc'), 3);
  assert.equal(levenshtein('abc', ''), 3);
});

test('precision and recall are perfect when there is no positive signal', () => {
  const results = [caseResult({ split: 'clean', input: 'ok', expectedOutput: 'ok', actualOutput: 'ok' })];
  const m = aggregateMetrics(results);
  assert.equal(m.precision, 1);
  assert.equal(m.recall, 1);
  assert.equal(m.overcorrectionRate, 0);
  assert.equal(m.cleanControlStability, 1);
});

test('precision/recall computed from edit counts', () => {
  const results = [
    caseResult({ split: 'mechanical', truePositives: 2, falsePositives: 1, falseNegatives: 1, outputExact: false, appliedCount: 3 }),
  ];
  const m = aggregateMetrics(results);
  assert.equal(m.precision, Math.round((2 / 3) * 10000) / 10000);
  assert.equal(m.recall, Math.round((2 / 3) * 10000) / 10000);
});

test('clean-control stability reflects over-correction', () => {
  const results = [
    caseResult({ split: 'clean', appliedCount: 0, outputExact: true }),
    caseResult({ split: 'clean', appliedCount: 1, outputExact: false }),
  ];
  const m = aggregateMetrics(results);
  assert.equal(m.cleanControlStability, 0.5);
});
