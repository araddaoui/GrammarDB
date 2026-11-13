import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { IdiomOptimaEngine } from '../src/engine/engine';
import { EngineMode } from '../src/engine/types';
import { parseCorpus } from '../src/benchmark/corpus';
import { compareTransformers, runBenchmark } from '../src/benchmark/runner';
import { BenchmarkReport } from '../src/benchmark/types';
import { DEFAULT_MIN_AUTO_APPLY_CONFIDENCE, SPEC_MIN_AUTO_APPLY_CONFIDENCE } from '../src/engine/policy';
import { BASELINE_ID, baselineGrammarTransform } from '../src/baseline/idiomOptimaGrammarLayer';

const root = path.resolve(import.meta.dirname, '..');
const corpusPath = path.join(root, 'src', 'benchmark', 'corpus.json');
const reportsDir = path.join(root, 'reports');

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function printReport(report: BenchmarkReport): void {
  const m = report.metrics;
  console.log(
    `  mode=${report.mode} minConf=${report.minAutoApplyConfidence} | cases=${m.cases} ` +
      `exact=${pct(m.outputExactRate)} P=${pct(m.precision)} R=${pct(m.recall)} F1=${pct(m.f1)} ` +
      `overcorrection=${pct(m.overcorrectionRate)} cleanStability=${pct(m.cleanControlStability)}`
  );
  console.log(`    split        cases  exact    P       R       F1      overcorr`);
  for (const s of report.perSplit) {
    console.log(
      `    ${s.split.padEnd(11)} ${String(s.cases).padStart(5)}  ${pct(s.outputExactRate).padStart(6)}  ` +
        `${pct(s.precision).padStart(6)}  ${pct(s.recall).padStart(6)}  ${pct(s.f1).padStart(6)}  ${pct(s.overcorrectionRate).padStart(6)}`
    );
  }
  const failures = report.results.filter((r) => !r.passed);
  if (failures.length > 0) {
    console.log(`    failing cases (${failures.length}):`);
    for (const f of failures) {
      const missed = f.missedEdits.map((e) => e.ruleId ?? `${e.original}->${e.replacement}`).join(',');
      const spurious = f.spuriousEdits.map((e) => e.ruleId).join(',');
      const forbidden = f.forbiddenHits.length ? ` forbidden=[${f.forbiddenHits.join(';')}]` : '';
      console.log(
        `      - ${f.caseId} [${f.split}] missed=[${missed}] spurious=[${spurious}]${forbidden}`
      );
    }
  }
}

function main(): void {
  const corpus = parseCorpus(JSON.parse(readFileSync(corpusPath, 'utf8')));
  const engine = new IdiomOptimaEngine();
  const status = engine.getSchemaStatus();
  if (!status.isValid) {
    console.error('Engine schema invalid:', status.errors);
    process.exit(1);
  }

  const runs: Array<{ mode: EngineMode; min?: number }> = [
    { mode: 'autoApply', min: DEFAULT_MIN_AUTO_APPLY_CONFIDENCE },
    { mode: 'autoApply', min: SPEC_MIN_AUTO_APPLY_CONFIDENCE },
    { mode: 'suggest' },
  ];

  mkdirSync(reportsDir, { recursive: true });
  console.log(`Corpus: ${corpus.corpusId}@${corpus.version} (${corpus.cases.length} cases)\n`);

  const reports: BenchmarkReport[] = [];
  for (const run of runs) {
    const report = runBenchmark(engine, corpus, { mode: run.mode, minAutoApplyConfidence: run.min });
    reports.push(report);
    printReport(report);
    console.log('');
  }

  // A/B head-to-head: GrammarDB deterministic core vs IdiomOptima's certified grammar layer.
  const candidate = (text: string) => ({ outputText: engine.process(text, { mode: 'autoApply' }).outputText });
  const baseline = (text: string) => ({ outputText: baselineGrammarTransform(text) });
  const comparison = compareTransformers(corpus, candidate, baseline);
  console.log(`A/B vs ${BASELINE_ID}:`);
  console.log(
    `  GrammarDB exact=${pct(comparison.candidateExactRate)} (mean dist ${comparison.candidateMeanDistance}) | ` +
      `baseline exact=${pct(comparison.baselineExactRate)} (mean dist ${comparison.baselineMeanDistance})`
  );
  console.log(`  wins=${comparison.wins} losses=${comparison.losses} ties=${comparison.ties} winner=${comparison.winner}`);

  const losses = comparison.comparisons.filter((c) => c.winner === 'baseline');
  if (losses.length > 0) {
    console.log(`  cases where baseline is closer to gold (${losses.length}):`);
    for (const c of losses) {
      console.log(`    - ${c.caseId}: gold="${c.gold}" grammarDB="${c.candidate}" baseline="${c.baseline}"`);
    }
  }
  console.log('');

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportsDir, `benchmark-${stamp}.json`);
  writeFileSync(reportPath, JSON.stringify({ corpusId: corpus.corpusId, reports, comparison }, null, 2) + '\n', 'utf8');
  console.log(`Report written: ${path.relative(root, reportPath)}`);
}

main();
