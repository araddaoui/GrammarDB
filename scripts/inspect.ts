import { readFileSync } from 'node:fs';
import { IdiomOptimaEngine } from '../src/engine/engine';
import { EngineConfig } from '../src/engine/types';

/**
 * Inspect engine behaviour for a list of sentences.
 *
 * Usage: tsx scripts/inspect.ts <file.json> [mode] [minConfidence]
 *   file.json: JSON array of strings, or { "texts": string[] }
 *   mode:      autoApply | suggest | shadow   (default autoApply)
 */

function loadTexts(file: string): string[] {
  const parsed = JSON.parse(readFileSync(file, 'utf8'));
  if (Array.isArray(parsed)) return parsed as string[];
  if (parsed && Array.isArray(parsed.texts)) return parsed.texts as string[];
  throw new Error('Inspect input must be a JSON string[] or { texts: string[] }');
}

function main(): void {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: tsx scripts/inspect.ts <file.json> [mode] [minConfidence]');
    process.exit(1);
  }
  const mode = (process.argv[3] as EngineConfig['mode']) || 'autoApply';
  const minConfidence = process.argv[4] ? Number(process.argv[4]) : undefined;

  const engine = new IdiomOptimaEngine();
  const status = engine.getSchemaStatus();
  if (!status.isValid) {
    console.error('Engine schema invalid:', status.errors);
    process.exit(1);
  }

  const texts = loadTexts(file);
  for (const text of texts) {
    const result = engine.process(text, { mode, minAutoApplyConfidence: minConfidence });
    const edits = result.appliedCandidates
      .map((c) => `${c.ruleId}:"${c.original}"->"${c.replacement}"@${c.confidence}`)
      .join(' | ');
    const suggested = result.suggestedCandidates.map((c) => c.ruleId).join(',');
    console.log(`IN : ${text}`);
    console.log(`OUT: ${result.outputText}`);
    console.log(`APP: ${edits || '(none)'}`);
    if (suggested) console.log(`SUG: ${suggested}`);
    console.log('');
  }
}

main();
