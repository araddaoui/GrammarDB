import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildCanonicalRulePack } from '../src/engine/canonicalPack';
import { IdiomOptimaEngine } from '../src/engine/engine';
import { segmentSentences } from '../src/engine/segmenter';
import {
  BASELINE_ID,
  BASELINE_CAPABILITIES,
  applyGrammarLayer,
} from '../src/baseline/idiomOptimaGrammarLayer';

const root = path.resolve(import.meta.dirname, '..');
const fixturesDir = path.join(root, 'src', 'benchmark', 'fixtures');
const reportsDir = path.join(root, 'reports');

function capabilityMatches(cap: { keywords: string[] }): string[] {
  const pack = buildCanonicalRulePack();
  const matched: string[] = [];
  for (const rule of pack.rules) {
    const hay = `${rule.id} ${rule.category} ${rule.description} ${rule.provenance ?? ''}`.toLowerCase();
    if (cap.keywords.some((k) => hay.includes(k.toLowerCase()))) {
      matched.push(rule.id);
    }
  }
  return matched;
}

interface SentenceDiff {
  file: string;
  input: string;
  grammarDB: string;
  baseline: string;
  grammarDBChanged: boolean;
  baselineChanged: boolean;
  relation: 'agree' | 'grammarDB-only' | 'baseline-only' | 'differ';
}

function splitSentences(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/\n+/)) {
    const line = raw.trim();
    if (!line) continue;
    const spans = segmentSentences(line);
    if (spans.length === 0) {
      out.push(line);
      continue;
    }
    for (const span of spans) {
      const t = span.text.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

function main(): void {
  console.log('=== Static capability divergence (heuristic: keyword match) ===\n');
  let baselineOnly = 0;
  let shared = 0;
  for (const cap of BASELINE_CAPABILITIES) {
    const matched = capabilityMatches(cap);
    const status = matched.length > 0 ? 'shared' : 'BASELINE-ONLY';
    if (matched.length > 0) shared++;
    else baselineOnly++;
    console.log(
      `  [${status.padEnd(13)}] ${cap.layer.padEnd(11)} ${cap.id.padEnd(24)} -> ${matched.slice(0, 6).join(', ') || '(no GrammarDB rule)'}`
    );
  }
  console.log(`\n  shared capabilities: ${shared} | baseline-only: ${baselineOnly}\n`);

  const engine = new IdiomOptimaEngine();
  const files = readdirSync(fixturesDir).filter((f) => f.endsWith('.txt'));
  const diffs: SentenceDiff[] = [];
  const counts = { agree: 0, grammarDBOnly: 0, baselineOnly: 0, differ: 0 };

  for (const file of files) {
    const text = readFileSync(path.join(fixturesDir, file), 'utf8');
    for (const sentence of splitSentences(text)) {
      const grammarDB = engine.process(sentence, { mode: 'autoApply' }).outputText;
      const baseline = applyGrammarLayer(sentence).text;
      const gChanged = grammarDB !== sentence;
      const bChanged = baseline !== sentence;
      let relation: SentenceDiff['relation'];
      if (grammarDB === baseline) relation = 'agree';
      else if (gChanged && !bChanged) relation = 'grammarDB-only';
      else if (!gChanged && bChanged) relation = 'baseline-only';
      else relation = 'differ';

      if (relation === 'agree') counts.agree++;
      else if (relation === 'grammarDB-only') counts.grammarDBOnly++;
      else if (relation === 'baseline-only') counts.baselineOnly++;
      else counts.differ++;

      if (relation !== 'agree') {
        diffs.push({ file, input: sentence, grammarDB, baseline, grammarDBChanged: gChanged, baselineChanged: bChanged, relation });
      }
    }
  }

  console.log('=== Behavioural divergence on fixture corpus ===\n');
  console.log(`  agree=${counts.agree} grammarDB-only=${counts.grammarDBOnly} baseline-only=${counts.baselineOnly} differ=${counts.differ}\n`);
  for (const d of diffs) {
    console.log(`  [${d.relation}] ${d.file}`);
    console.log(`    in : ${d.input}`);
    if (d.grammarDBChanged) console.log(`    gdb: ${d.grammarDB}`);
    if (d.baselineChanged) console.log(`    bl : ${d.baseline}`);
    console.log('');
  }

  mkdirSync(reportsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportsDir, `divergence-${stamp}.json`);
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        baselineId: BASELINE_ID,
        capabilities: BASELINE_CAPABILITIES.map((c) => ({ ...c, grammarDBRules: capabilityMatches(c) })),
        behavioural: { counts, diffs },
      },
      null,
      2
    ) + '\n',
    'utf8'
  );
  console.log(`Report written: ${path.relative(root, reportPath)}`);
}

main();
