import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { applyGrammarLayer, baselineGrammarTransform } from '../idiomOptimaGrammarLayer';

test('baseline fixes a/an by sound', () => {
  assert.equal(applyGrammarLayer('An university in Tehran faced this challenge.').text, 'A university in Tehran faced this challenge.');
});

test('baseline fixes plural/singular subject-verb agreement (copula forms)', () => {
  assert.equal(applyGrammarLayer('The findings is consistent with the wealth model.').text, 'The findings are consistent with the wealth model.');
  assert.equal(applyGrammarLayer('A study are needed to settle the debate.').text, 'A study is needed to settle the debate.');
});

test('baseline collapses doubled subject', () => {
  assert.equal(applyGrammarLayer('This approach it shows the trend clearly.').text, 'This approach shows the trend clearly.');
});

test('baseline is quote-safe (protects quoted spans)', () => {
  const input = 'He said "This is  a test."';
  assert.equal(applyGrammarLayer(input).text, input);
});

test('baseline collapses doubled spaces outside quotes', () => {
  assert.equal(applyGrammarLayer('Hello  world.').text, 'Hello world.');
});

test('baseline transform entry point matches applyGrammarLayer', () => {
  const s = 'The reason is because the data lagged behind.';
  assert.equal(baselineGrammarTransform(s), applyGrammarLayer(s).text);
});
