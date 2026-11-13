import { GrammarExceptionsSchema, GrammarRulesSchema, Rule, RuleRiskLevel, RuleStatus } from './types';
import { COMPREHENSIVE_RULES } from './rules';
import { CONDITIONAL_RULES } from './conditionals';
import { OFFICIAL_GRAMMAR_EXCEPTIONS } from './guards';
import { CANONICAL_PACK_ID, CANONICAL_PACK_VERSION, CANONICAL_ENGINE_VERSION } from './version';

/**
 * Derives the lifecycle status of a rule when the authoring source has not set
 * one explicitly. This is the migration gate:
 *
 *  - a rule that the engine can run deterministically today (a plain regex with
 *    a string pattern) is `stable`;
 *  - anything requiring an analyser, lexicon, or dependency pattern is
 *    `experimental` until proven otherwise.
 *
 * Authors may override by setting `rule.status` directly.
 */
export function deriveRuleStatus(rule: Rule): RuleStatus {
  if (rule.status) return rule.status;
  if (rule.match.type === 'regex' && typeof rule.match.pattern === 'string') {
    return 'stable';
  }
  return 'experimental';
}

export function deriveRuleRisk(rule: Rule): RuleRiskLevel {
  if (rule.riskLevel) return rule.riskLevel;
  if (rule.match.type !== 'regex' || typeof rule.match.pattern !== 'string') return 'high';
  if (rule.category === 'PUN' || rule.category === 'SPELL' || rule.category === 'STYLE') return 'low';
  if (rule.category === 'L1-AR' || rule.category === 'L1-FR') return 'medium';
  return 'medium';
}

function withLifecycle(rule: Rule): Rule {
  return {
    ...rule,
    status: deriveRuleStatus(rule),
    riskLevel: deriveRuleRisk(rule),
  };
}

/**
 * The canonical, in-memory rule pack. Rule ORDER is preserved from the
 * authoring source because ordering can influence candidate tie-breaking; do
 * not sort here. The exporter serializes this verbatim.
 */
export function buildCanonicalRulePack(): GrammarRulesSchema {
  const merged: Rule[] = [...COMPREHENSIVE_RULES];
  const seen = new Set(merged.map((r) => r.id));
  for (const rule of CONDITIONAL_RULES) {
    if (!seen.has(rule.id)) {
      merged.push(rule);
      seen.add(rule.id);
    }
  }

  return {
    schemaVersion: '0.2.0',
    packId: CANONICAL_PACK_ID,
    packVersion: CANONICAL_PACK_VERSION,
    generatedFrom: `rules.ts + conditionals.ts (engine ${CANONICAL_ENGINE_VERSION})`,
    language: 'en',
    purpose: 'IdiomOptima Universal Multi-Tier English Grammar Database.',
    defaults: {
      autoApply: false,
      minAutoApplyConfidence: 0.98,
      dialect: 'preserve-user-setting',
    },
    rules: merged.map(withLifecycle),
  };
}

export function buildCanonicalExceptionPack(): GrammarExceptionsSchema {
  return OFFICIAL_GRAMMAR_EXCEPTIONS;
}
