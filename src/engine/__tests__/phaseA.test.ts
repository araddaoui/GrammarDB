import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { IdiomOptimaEngine } from '../engine';
import { EngineConfig } from '../types';

const engine = new IdiomOptimaEngine();
const auto = (text: string): string =>
  engine.process(text, { mode: 'autoApply', minAutoApplyConfidence: 0.98 } as EngineConfig).outputText;

test('closes the certified article gap (an university -> a university)', () => {
  assert.equal(auto('An university in Tehran faced this challenge at a rapid pace.'), 'A university in Tehran faced this challenge at a rapid pace.');
});

test('closes the certified plural copula gap (findings is -> findings are)', () => {
  assert.equal(auto('The findings is consistent with the wealth model.'), 'The findings are consistent with the wealth model.');
});

test('closes the certified singular copula gap (study are -> study is)', () => {
  assert.equal(auto('A study are needed to settle the debate.'), 'A study is needed to settle the debate.');
});

test('closes the doubled-subject gap', () => {
  assert.equal(auto('This approach it shows the trend clearly.'), 'This approach shows the trend clearly.');
  assert.equal(auto('The army they advanced toward the objective.'), 'The army advanced toward the objective.');
});

test('article sound model fixes a-vowel words including apple', () => {
  assert.equal(auto('This is a apple.'), 'This is an apple.');
});

test('quotes are protected by default (guard-003)', () => {
  assert.equal(auto('He said "This is  a test."'), 'He said "This is  a test."');
});

test('quotes can be opted out of with protectQuotes: false', () => {
  const out = engine.process('He said "This is  a test."', { mode: 'autoApply', protectQuotes: false }).outputText;
  assert.equal(out, 'He said "This is a test."');
});

test('restraint: parser split is never auto-applied', () => {
  for (const s of [
    'The dogs is barking loudly.',
    'The information are accurate.',
    'She go to school every day.',
    'He is more taller than me.',
    'I am agree with you.',
  ]) {
    assert.equal(auto(s), s);
  }
});

test('restraint: clean academic prose is untouched', () => {
  for (const s of [
    'A university was founded in 1890.',
    'An hour has passed.',
    'This is an apple.',
    'The results show a clear trend.',
  ]) {
    assert.equal(auto(s), s);
  }
});
