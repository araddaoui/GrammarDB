import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildCanonicalExceptionPack,
  buildCanonicalRulePack,
} from '../src/engine/canonicalPack';
import { serializeExceptionPack, serializeRulePack } from '../src/engine/ruleSchema';

const root = path.resolve(import.meta.dirname, '..');
const rulesPath = path.join(root, 'src', 'rules', 'grammar_rules.canonical.json');
const exceptionsPath = path.join(root, 'src', 'rules', 'grammar_exceptions.canonical.json');

function compare(label: string, filePath: string, expected: string): boolean {
  if (!existsSync(filePath)) {
    console.error(`DRIFT: ${label} is missing at ${path.relative(root, filePath)}`);
    return false;
  }
  const actual = readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  if (actual !== expected) {
    console.error(`DRIFT: ${label} does not match the authoring source.`);
    return false;
  }
  return true;
}

function main(): void {
  const rulesOk = compare('grammar_rules.canonical.json', rulesPath, serializeRulePack(buildCanonicalRulePack()));
  const exceptionsOk = compare(
    'grammar_exceptions.canonical.json',
    exceptionsPath,
    serializeExceptionPack(buildCanonicalExceptionPack())
  );

  if (!rulesOk || !exceptionsOk) {
    console.error('\nRun `npm run export:rules` to regenerate the canonical artifacts.');
    process.exit(1);
  }
  console.log('No drift: canonical JSON matches the authoring source.');
}

main();
