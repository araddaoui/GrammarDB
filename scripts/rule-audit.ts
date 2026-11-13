import { buildCanonicalRulePack } from '../src/engine/canonicalPack';
import { Rule } from '../src/engine/types';

function isActiveRegex(rule: Rule): boolean {
  return rule.enabled && rule.match.type === 'regex' && typeof rule.match.pattern === 'string';
}

function main(): void {
  const pack = buildCanonicalRulePack();
  const rules = pack.rules;

  const active = rules.filter(isActiveRegex);
  const disabled = rules.filter((r) => !r.enabled);
  const nonRegex = rules.filter((r) => r.match.type !== 'regex');
  const regexDisabled = rules.filter((r) => r.match.type === 'regex' && !r.enabled);
  const activeAutoApply = active.filter((r) => r.autoApply);

  console.log('GrammarDB canonical rule audit');
  console.log(`  total rules:            ${rules.length}`);
  console.log(`  active (regex+enabled): ${active.length}`);
  console.log(`  active & autoApply:     ${activeAutoApply.length}`);
  console.log(`  disabled:               ${disabled.length}`);
  console.log(`  non-regex (inert):      ${nonRegex.length}`);
  console.log(`  regex-but-disabled:     ${regexDisabled.length}`);
  console.log('');

  const byMatch: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const r of rules) {
    byMatch[r.match.type] = (byMatch[r.match.type] ?? 0) + 1;
    byStatus[r.status ?? 'none'] = (byStatus[r.status ?? 'none'] ?? 0) + 1;
  }
  console.log(`  by match.type: ${JSON.stringify(byMatch)}`);
  console.log(`  by status:     ${JSON.stringify(byStatus)}`);
  console.log('');

  console.log('  ACTIVE rules:');
  for (const r of active.sort((a, b) => (a.category + a.id).localeCompare(b.category + b.id))) {
    console.log(`    ${r.category.padEnd(6)} ${r.id.padEnd(34)} conf=${r.confidence} autoApply=${r.autoApply}`);
  }
}

main();
