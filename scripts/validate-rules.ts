import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  validateExceptionsPack,
  validateRulePack,
} from '../src/engine/ruleSchema';
import { RuleStore } from '../src/engine/ruleStore';

const root = path.resolve(import.meta.dirname, '..');
const rulesPath = path.join(root, 'src', 'rules', 'grammar_rules.canonical.json');
const exceptionsPath = path.join(root, 'src', 'rules', 'grammar_exceptions.canonical.json');

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function main(): void {
  for (const p of [rulesPath, exceptionsPath]) {
    if (!existsSync(p)) {
      console.error(`Missing canonical artifact: ${path.relative(root, p)}. Run \`npm run export:rules\`.`);
      process.exit(1);
    }
  }

  const rulePack = readJson(rulesPath);
  const exceptionPack = readJson(exceptionsPath);

  const ruleDiag = validateRulePack(rulePack);
  const exDiag = validateExceptionsPack(exceptionPack);

  for (const w of [...ruleDiag.warnings, ...exDiag.warnings]) console.warn(`warn: ${w}`);
  for (const e of [...ruleDiag.errors, ...exDiag.errors]) console.error(`error: ${e}`);

  if (!ruleDiag.isValid || !exDiag.isValid) {
    console.error(`\nFAIL: canonical packs invalid (${ruleDiag.errors.length + exDiag.errors.length} errors).`);
    process.exit(1);
  }

  const store = RuleStore.create(rulePack as never, exceptionPack as never);
  const stats = store.stats();
  console.log(`OK: canonical packs valid.`);
  console.log(`  rules: ${stats.totalRules} (${stats.stableRules} stable, ${stats.experimentalRules} experimental, ${stats.candidateRules} candidate, ${stats.deprecatedRules} deprecated)`);
  console.log(`  warnings: ${ruleDiag.warnings.length + exDiag.warnings.length}`);
}

main();
