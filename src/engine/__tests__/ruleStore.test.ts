import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildCanonicalExceptionPack, buildCanonicalRulePack } from '../canonicalPack';
import { RulePackError, RuleStore, tryCreateRuleStore } from '../ruleStore';

test('rule store indexes the canonical pack', () => {
  const store = RuleStore.create(buildCanonicalRulePack(), buildCanonicalExceptionPack());
  const stats = store.stats();
  assert.ok(stats.totalRules > 0);
  assert.ok(stats.stableRules > 0);
  assert.ok(store.getEnabledRules().length > 0);
  assert.equal(store.getRule('PUN-SPACE-002')?.category, 'PUN');
});

test('deprecated rules are never exposed as enabled', () => {
  const store = RuleStore.create(buildCanonicalRulePack(), buildCanonicalExceptionPack());
  assert.ok(store.getEnabledRules().every((r) => r.status !== 'deprecated'));
});

test('create throws on an invalid pack (fail closed)', () => {
  const pack = JSON.parse(JSON.stringify(buildCanonicalRulePack()));
  pack.rules.push({ ...pack.rules[0] }); // duplicate id
  assert.throws(() => RuleStore.create(pack, buildCanonicalExceptionPack()), RulePackError);
});

test('tryCreateRuleStore returns a null store instead of throwing', () => {
  const pack = JSON.parse(JSON.stringify(buildCanonicalRulePack()));
  pack.rules.push({ ...pack.rules[0], id: 'BAD', confidence: -1 });
  const result = tryCreateRuleStore(pack, buildCanonicalExceptionPack());
  assert.equal(result.store, null);
  assert.ok(result.errors.length > 0);
});

test('only regex stable rules are exportable at stable scope', () => {
  const store = RuleStore.create(buildCanonicalRulePack(), buildCanonicalExceptionPack());
  const exportable = store.getExportableRules('stable');
  assert.ok(exportable.length > 0);
  assert.ok(exportable.every((r) => r.status === 'stable' && r.match.type === 'regex'));
});
