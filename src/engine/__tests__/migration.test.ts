import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildCanonicalExceptionPack, buildCanonicalRulePack } from '../canonicalPack';
import { RuleStore } from '../ruleStore';
import {
  buildPortableBundle,
  verifyPortableBundle,
} from '../migration';

function makeStore() {
  return RuleStore.create(buildCanonicalRulePack(), buildCanonicalExceptionPack());
}

test('stable bundle contains only stable auto-apply rules and self-verifies', () => {
  const bundle = buildPortableBundle(makeStore(), { scope: 'stable' });
  assert.ok(bundle.exports.counts.exported > 0);
  assert.ok(bundle.rulePack.rules.every((r) => r.status === 'stable'));
  const verification = verifyPortableBundle(bundle);
  assert.equal(verification.ok, true, verification.errors.join('; '));
});

test('tampering with a bundled rule is detected by the checksum', () => {
  const bundle = buildPortableBundle(makeStore(), { scope: 'stable' });
  bundle.rulePack.rules[0] = { ...bundle.rulePack.rules[0], replacement: 'HACKED' };
  const verification = verifyPortableBundle(bundle);
  assert.equal(verification.ok, false);
  assert.ok(verification.errors.some((e) => e.includes('Checksum mismatch')));
});

test('an incompatible consumer engine major is rejected', () => {
  const bundle = buildPortableBundle(makeStore(), { scope: 'stable' });
  const verification = verifyPortableBundle(bundle, 99);
  assert.equal(verification.ok, false);
  assert.ok(verification.errors.some((e) => e.includes('Consumer supports engine API major')));
});

test('all scope exports experimental rules too but still verifies', () => {
  const bundle = buildPortableBundle(makeStore(), { scope: 'all' });
  assert.equal(bundle.exports.counts.exported, bundle.exports.counts.total);
  const verification = verifyPortableBundle(bundle);
  assert.equal(verification.ok, true, verification.errors.join('; '));
});
