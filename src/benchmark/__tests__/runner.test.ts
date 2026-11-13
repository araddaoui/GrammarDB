import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { IdiomOptimaEngine } from '../../engine/engine';
import { parseCorpus } from '../corpus';
import { compareTransformers, runBenchmark } from '../runner';
import { BenchmarkCorpus } from '../types';

const corpus: BenchmarkCorpus = {
  corpusId: 'test',
  version: '0.0.1',
  description: 'tiny',
  cases: [
    {
      id: 'clean',
      split: 'clean',
      input: 'This sentence is fine.',
      expectedOutput: 'This sentence is fine.',
      goldEdits: [],
    },
    {
      id: 'fixable',
      split: 'mechanical',
      input: 'Hello  world.',
      expectedOutput: 'Hello world.',
      goldEdits: [{ ruleId: 'PUN-SPACE-002', original: '  ', replacement: ' ' }],
    },
  ],
};

test('runBenchmark produces a report with per-split metrics', () => {
  const engine = new IdiomOptimaEngine();
  const report = runBenchmark(engine, corpus, { mode: 'autoApply', now: () => new Date(0) });
  assert.equal(report.metrics.cases, 2);
  assert.equal(report.results.length, 2);
  assert.ok(report.perSplit.some((s) => s.split === 'clean'));
  assert.equal(report.generatedAt, new Date(0).toISOString());
});

test('compareTransformers scores candidate against a baseline', () => {
  const engine = new IdiomOptimaEngine();
  const candidate = (t: string) => ({ outputText: engine.process(t, { mode: 'autoApply' }).outputText });
  const identity = (t: string) => ({ outputText: t });
  const comparison = compareTransformers(corpus, candidate, identity);
  assert.equal(comparison.cases, 2);
  assert.equal(comparison.wins + comparison.losses + comparison.ties, 2);
});

test('corpus validation rejects malformed cases', () => {
  assert.throws(() =>
    parseCorpus({
      corpusId: 'x',
      version: '0',
      description: '',
      cases: [{ id: 'a', split: 'nope', input: 'x', expectedOutput: 'x', goldEdits: [] }],
    })
  );
});
