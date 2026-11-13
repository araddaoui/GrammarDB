import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildCanonicalExceptionPack,
  buildCanonicalRulePack,
} from '../src/engine/canonicalPack';
import {
  serializeExceptionPack,
  serializeRulePack,
  validateExceptionsPack,
  validateRulePack,
} from '../src/engine/ruleSchema';
import { RuleStore } from '../src/engine/ruleStore';
import {
  buildPortableBundle,
  serializeBundle,
  verifyPortableBundle,
} from '../src/engine/migration';

const root = path.resolve(import.meta.dirname, '..');
const rulesDir = path.join(root, 'src', 'rules');
const exportsDir = path.join(root, 'exports');

function main(): void {
  const rulePack = buildCanonicalRulePack();
  const exceptionPack = buildCanonicalExceptionPack();

  const ruleDiag = validateRulePack(rulePack);
  const exDiag = validateExceptionsPack(exceptionPack);

  if (!ruleDiag.isValid || !exDiag.isValid) {
    console.error('Canonical packs are invalid; refusing to export.');
    for (const e of [...ruleDiag.errors, ...exDiag.errors]) console.error(`  - ${e}`);
    process.exit(1);
  }

  const store = RuleStore.create(rulePack, exceptionPack);
  const stats = store.stats();

  const bundle = buildPortableBundle(store, { scope: 'stable' });
  const verification = verifyPortableBundle(bundle);
  if (!verification.ok) {
    console.error('Portable bundle failed self-verification; refusing to export.');
    for (const e of verification.errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  mkdirSync(rulesDir, { recursive: true });
  mkdirSync(exportsDir, { recursive: true });

  const rulesPath = path.join(rulesDir, 'grammar_rules.canonical.json');
  const exceptionsPath = path.join(rulesDir, 'grammar_exceptions.canonical.json');
  const bundlePath = path.join(exportsDir, 'idiomoptima-grammar.bundle.json');

  writeFileSync(rulesPath, serializeRulePack(rulePack), 'utf8');
  writeFileSync(exceptionsPath, serializeExceptionPack(exceptionPack), 'utf8');
  writeFileSync(bundlePath, serializeBundle(bundle), 'utf8');

  console.log('Canonical grammar layer exported.');
  console.log(`  rules:      ${stats.totalRules} total | ${stats.stableRules} stable | ${stats.experimentalRules} experimental | ${stats.candidateRules} candidate`);
  console.log(`  categories: ${Object.entries(stats.byCategory).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  console.log(`  warnings:   ${ruleDiag.warnings.length + exDiag.warnings.length}`);
  console.log(`  bundle:     scope=${bundle.exports.scope} exported=${bundle.exports.counts.exported}/${bundle.exports.counts.total} checksum=${bundle.manifest.checksum}`);
  console.log(`  written:    ${path.relative(root, rulesPath)}`);
  console.log(`              ${path.relative(root, exceptionsPath)}`);
  console.log(`              ${path.relative(root, bundlePath)}`);
}

main();
