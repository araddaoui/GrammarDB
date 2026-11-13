import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildCanonicalRulePack } from '../canonicalPack';
import {
  serializeRulePack,
  validateRulePack,
} from '../ruleSchema';
import { Rule } from '../types';

function clonePack() {
  return JSON.parse(JSON.stringify(buildCanonicalRulePack()));
}

test('canonical pack validates cleanly', () => {
  const diag = validateRulePack(buildCanonicalRulePack());
  assert.equal(diag.isValid, true, diag.errors.join('; '));
});

test('duplicate rule ids are rejected', () => {
  const pack = clonePack();
  pack.rules.push({ ...pack.rules[0] });
  const diag = validateRulePack(pack);
  assert.equal(diag.isValid, false);
  assert.ok(diag.errors.some((e: string) => e.includes('Duplicate rule id')));
});

test('uncompilable regex is rejected', () => {
  const pack = clonePack();
  const rule: Rule = {
    ...pack.rules.find((r: Rule) => r.match.type === 'regex'),
    id: 'TEST-BAD-REGEX',
    match: { type: 'regex', pattern: '(' },
  };
  pack.rules.push(rule);
  const diag = validateRulePack(pack);
  assert.equal(diag.isValid, false);
  assert.ok(diag.errors.some((e: string) => e.includes('uncompilable regex')));
});

test('out-of-range confidence is rejected', () => {
  const pack = clonePack();
  pack.rules.push({ ...pack.rules[0], id: 'TEST-BAD-CONF', confidence: 1.5 });
  const diag = validateRulePack(pack);
  assert.equal(diag.isValid, false);
  assert.ok(diag.errors.some((e: string) => e.includes('confidence must be a number between 0 and 1')));
});

test('serialization is deterministic and newline-terminated', () => {
  const a = serializeRulePack(buildCanonicalRulePack());
  const b = serializeRulePack(buildCanonicalRulePack());
  assert.equal(a, b);
  assert.ok(a.endsWith('\n'));
});
