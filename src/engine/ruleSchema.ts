import {
  GrammarExceptionsSchema,
  GrammarRulesSchema,
  Rule,
  RuleMatch,
  RuleReplacement,
  RuleRiskLevel,
  RuleStatus,
} from './types';

/**
 * Canonical rule-pack schema version. Bump this whenever the *shape* of a rule
 * pack or its semantics change in a way a consumer must know about. Consumers
 * (e.g. IdiomOptima) must refuse a pack whose major version they do not support.
 */
export const RULE_PACK_SCHEMA_VERSION = '0.2.0';
export const EXCEPTIONS_PACK_SCHEMA_VERSION = '0.2.0';

const VALID_MATCH_TYPES: ReadonlyArray<RuleMatch['type']> = [
  'regex',
  'token_pattern',
  'dependency_pattern',
  'contextual_lexical_pattern',
  'lexical_frame',
  'morphosyntactic_pattern',
  'same_as_rule',
];

const VALID_STATUS: ReadonlyArray<RuleStatus> = [
  'experimental',
  'candidate',
  'stable',
  'deprecated',
];

const VALID_RISK: ReadonlyArray<RuleRiskLevel> = ['low', 'medium', 'high'];

const VALID_ACTIONS = ['auto_apply', 'suggest', 'escalate_to_ai', 'ask_author'];

const VALID_SEVERITY = ['minor', 'medium', 'high'];

/**
 * Categories defined by the engine spec ontology plus the extended categories
 * currently present in the authoring source. Unknown categories are surfaced as
 * warnings (not hard errors) so a new category cannot silently pass unnoticed,
 * but also cannot brick an otherwise-valid pack.
 */
export const KNOWN_CATEGORIES: ReadonlyArray<string> = [
  'AGR',
  'ART',
  'NUM',
  'TNS',
  'PREP',
  'PRON',
  'WORD',
  'COLL',
  'CLAUSE',
  'PUN',
  'SPELL',
  'L1-AR',
  'L1-FR',
  'STYLE',
  'PROTECT',
  // Extended authoring categories present in rules.ts / conditionals.ts
  'ADV',
  'MODAL',
  'COND',
  'SYN',
];

export interface SchemaDiagnostics {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function compilePattern(pattern: string, ruleId: string, errors: string[]): void {
  try {
    // Probe both the default and case-insensitive forms the engine may use.
    new RegExp(pattern, 'g');
    new RegExp(pattern, 'ig');
  } catch (err) {
    errors.push(`Rule ${ruleId} has an uncompilable regex pattern: ${(err as Error).message}`);
  }
}

/**
 * Strict, fail-closed validation of a canonical rule pack. Returns every problem
 * it can find rather than stopping at the first. `isValid` is false if any error
 * exists; warnings never affect `isValid`.
 */
export function validateRulePack(schema: unknown): SchemaDiagnostics {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isPlainObject(schema)) {
    return { isValid: false, errors: ['Rules pack root must be an object'], warnings };
  }

  if (typeof schema.schemaVersion !== 'string' || !schema.schemaVersion.trim()) {
    errors.push('Missing or invalid schemaVersion');
  }
  if (typeof schema.language !== 'string' || !schema.language.trim()) {
    errors.push('Missing or invalid language');
  }
  if (typeof schema.purpose !== 'string' || !schema.purpose.trim()) {
    errors.push('Missing or invalid purpose');
  }

  const defaults = schema.defaults;
  if (!isPlainObject(defaults)) {
    errors.push('Missing defaults object');
  } else {
    if (typeof defaults.autoApply !== 'boolean') {
      errors.push('defaults.autoApply must be a boolean');
    }
    if (!isFiniteNumber(defaults.minAutoApplyConfidence) || defaults.minAutoApplyConfidence < 0 || defaults.minAutoApplyConfidence > 1) {
      errors.push('defaults.minAutoApplyConfidence must be a number between 0 and 1');
    }
    if (typeof defaults.dialect !== 'string' || !defaults.dialect.trim()) {
      errors.push('defaults.dialect must be a non-empty string');
    }
  }

  if (!Array.isArray(schema.rules)) {
    errors.push('rules must be an array');
    return { isValid: false, errors, warnings };
  }

  const seenIds = new Set<string>();
  const duplicateIds = new Set<string>();

  schema.rules.forEach((rule: unknown, idx: number) => {
    if (!isPlainObject(rule)) {
      errors.push(`Rule at index ${idx} is not an object`);
      return;
    }
    const id = typeof rule.id === 'string' && rule.id.trim() ? rule.id : `#${idx}`;
    if (id !== rule.id) {
      errors.push(`Rule at index ${idx} is missing a string id`);
    }
    if (typeof rule.id === 'string') {
      if (seenIds.has(rule.id)) duplicateIds.add(rule.id);
      seenIds.add(rule.id);
    }

    if (typeof rule.category !== 'string' || !rule.category.trim()) {
      errors.push(`Rule ${id} is missing category`);
    } else if (!KNOWN_CATEGORIES.includes(rule.category)) {
      warnings.push(`Rule ${id} uses unrecognised category "${rule.category}"`);
    }

    if (!isFiniteNumber(rule.priority)) {
      errors.push(`Rule ${id} priority must be a finite number`);
    }
    if (typeof rule.description !== 'string' || !rule.description.trim()) {
      errors.push(`Rule ${id} is missing description`);
    }

    // match
    if (!isPlainObject(rule.match)) {
      errors.push(`Rule ${id} is missing match object`);
    } else {
      const match = rule.match as Record<string, unknown>;
      if (typeof match.type !== 'string' || !VALID_MATCH_TYPES.includes(match.type as RuleMatch['type'])) {
        errors.push(`Rule ${id} match.type must be one of ${VALID_MATCH_TYPES.join(', ')}`);
      }
      if (match.type === 'regex') {
        const pattern = match.pattern;
        if (typeof pattern === 'string') {
          if (!pattern) errors.push(`Rule ${id} regex pattern must be non-empty`);
          else compilePattern(pattern, id, errors);
        } else if (Array.isArray(pattern)) {
          if (pattern.length === 0) errors.push(`Rule ${id} regex pattern array must be non-empty`);
          pattern.forEach((p: unknown, pIdx: number) => {
            if (typeof p !== 'string' || !p) errors.push(`Rule ${id} regex pattern[${pIdx}] must be a non-empty string`);
            else compilePattern(p, id, errors);
          });
        } else {
          errors.push(`Rule ${id} regex match must define a string or string[] pattern`);
        }
      }
    }

    // replacement
    if (rule.replacement === undefined || rule.replacement === null) {
      errors.push(`Rule ${id} is missing replacement`);
    } else if (typeof rule.replacement !== 'string' && !isPlainObject(rule.replacement)) {
      errors.push(`Rule ${id} replacement must be a string or an object`);
    } else if (isPlainObject(rule.replacement)) {
      if (typeof (rule.replacement as RuleReplacement & { type?: unknown }).type !== 'string') {
        errors.push(`Rule ${id} object replacement must define a string type`);
      }
    }

    if (!isFiniteNumber(rule.confidence) || rule.confidence < 0 || rule.confidence > 1) {
      errors.push(`Rule ${id} confidence must be a number between 0 and 1`);
    }
    if (typeof rule.autoApply !== 'boolean') {
      errors.push(`Rule ${id} autoApply must be a boolean`);
    }
    if (typeof rule.enabled !== 'boolean') {
      errors.push(`Rule ${id} enabled must be a boolean`);
    }
    if (!Array.isArray(rule.requires) || rule.requires.some((r: unknown) => typeof r !== 'string')) {
      errors.push(`Rule ${id} requires must be an array of strings`);
    }
    if (!Array.isArray(rule.guards) || rule.guards.some((g: unknown) => typeof g !== 'string')) {
      errors.push(`Rule ${id} guards must be an array of strings`);
    }
    if (rule.status !== undefined && !VALID_STATUS.includes(rule.status as RuleStatus)) {
      errors.push(`Rule ${id} status must be one of ${VALID_STATUS.join(', ')}`);
    }
    if (rule.riskLevel !== undefined && !VALID_RISK.includes(rule.riskLevel as RuleRiskLevel)) {
      errors.push(`Rule ${id} riskLevel must be one of ${VALID_RISK.join(', ')}`);
    }
    if (rule.action !== undefined && (typeof rule.action !== 'string' || !VALID_ACTIONS.includes(rule.action))) {
      errors.push(`Rule ${id} action must be one of ${VALID_ACTIONS.join(', ')}`);
    }
    if (rule.severity !== undefined && (typeof rule.severity !== 'string' || !VALID_SEVERITY.includes(rule.severity))) {
      errors.push(`Rule ${id} severity must be one of ${VALID_SEVERITY.join(', ')}`);
    }

    // Auto-apply policy advisory (spec §3.2). Not fatal, but a rule claiming
    // autoApply while sitting below the configured floor is a likely defect.
    if (isPlainObject(defaults) && isFiniteNumber(defaults.minAutoApplyConfidence) && rule.autoApply === true && isFiniteNumber(rule.confidence) && rule.confidence < (defaults.minAutoApplyConfidence as number)) {
      warnings.push(
        `Rule ${id} sets autoApply=true but confidence ${rule.confidence} < minAutoApplyConfidence ${defaults.minAutoApplyConfidence}`
      );
    }

    if (rule.examples !== undefined) {
      const ex = rule.examples;
      if (!isPlainObject(ex) || !Array.isArray(ex.positive) || !Array.isArray(ex.negative)) {
        errors.push(`Rule ${id} examples must define positive[] and negative[] arrays`);
      }
    }
  });

  duplicateIds.forEach((dup) => errors.push(`Duplicate rule id "${dup}"`));

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateExceptionsPack(schema: unknown): SchemaDiagnostics {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isPlainObject(schema)) {
    return { isValid: false, errors: ['Exceptions pack root must be an object'], warnings };
  }
  if (typeof schema.schemaVersion !== 'string' || !schema.schemaVersion.trim()) {
    errors.push('Missing or invalid schemaVersion');
  }
  if (typeof schema.purpose !== 'string' || !schema.purpose.trim()) {
    errors.push('Missing or invalid purpose');
  }
  if (!Array.isArray(schema.protectedSpanKinds) || schema.protectedSpanKinds.some((k: unknown) => typeof k !== 'string')) {
    errors.push('protectedSpanKinds must be an array of strings');
  }
  if (!Array.isArray(schema.dialectNotes) || schema.dialectNotes.some((n: unknown) => typeof n !== 'string')) {
    errors.push('dialectNotes must be an array of strings');
  }
  if (!Array.isArray(schema.applicationNotes) || schema.applicationNotes.some((n: unknown) => typeof n !== 'string')) {
    errors.push('applicationNotes must be an array of strings');
  }

  if (!Array.isArray(schema.globalGuards)) {
    errors.push('globalGuards must be an array');
  } else {
    const seen = new Set<string>();
    schema.globalGuards.forEach((guard: unknown, idx: number) => {
      if (!isPlainObject(guard)) {
        errors.push(`Global guard at index ${idx} is not an object`);
        return;
      }
      if (typeof guard.id !== 'string' || !guard.id.trim()) errors.push(`Global guard at index ${idx} is missing id`);
      else if (seen.has(guard.id)) errors.push(`Duplicate global guard id "${guard.id}"`);
      else seen.add(guard.id);
      if (typeof guard.condition !== 'string' || !guard.condition.trim()) errors.push(`Global guard ${guard.id ?? idx} is missing condition`);
      if (typeof guard.reason !== 'string' || !guard.reason.trim()) errors.push(`Global guard ${guard.id ?? idx} is missing reason`);
      if (!VALID_ACTIONS.includes(guard.action as string) && guard.action !== 'reject_candidate' && guard.action !== 'escalate' && guard.action !== 'stop_sentence_and_log') {
        errors.push(`Global guard ${guard.id ?? idx} action must be reject_candidate | escalate | stop_sentence_and_log`);
      }
    });
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export interface RulePackParseResult {
  ok: boolean;
  pack?: GrammarRulesSchema;
  diagnostics: SchemaDiagnostics;
}

export function parseRulePack(value: unknown): RulePackParseResult {
  const diagnostics = validateRulePack(value);
  if (!diagnostics.isValid) return { ok: false, diagnostics };
  return { ok: true, pack: value as GrammarRulesSchema, diagnostics };
}

/**
 * Deterministic normalisation. Preserves rule *array order* (rule ordering can
 * affect tie-breaking in conflict resolution) while fixing key order and
 * dropping `undefined` so serialization is byte-stable across runs/machines.
 */
function canonicalizeReplacement(replacement: RuleReplacement): RuleReplacement {
  if (typeof replacement === 'string') return replacement;
  const r = replacement as Record<string, unknown>;
  const out: Record<string, unknown> = { type: r.type };
  if (r.target !== undefined) out.target = r.target;
  if (r.features !== undefined) out.features = r.features;
  if (r.source !== undefined) out.source = r.source;
  if (r.ruleId !== undefined) out.ruleId = r.ruleId;
  if (r.featuresFrom !== undefined) out.featuresFrom = r.featuresFrom;
  return out as unknown as RuleReplacement;
}

function canonicalizeMatch(match: RuleMatch): RuleMatch {
  const out: Record<string, unknown> = { type: match.type };
  if (match.pattern !== undefined) out.pattern = match.pattern;
  if (match.caseInsensitive !== undefined) out.caseInsensitive = match.caseInsensitive;
  if (match.subjectHead !== undefined) out.subjectHead = match.subjectHead;
  if (match.verb !== undefined) out.verb = match.verb;
  if (match.relation !== undefined) out.relation = match.relation;
  if (match.clauseType !== undefined) out.clauseType = match.clauseType;
  if (match.requiresDeterminerEvidence !== undefined) out.requiresDeterminerEvidence = match.requiresDeterminerEvidence;
  if (match.frame !== undefined) out.frame = match.frame;
  if (match.lexiconKey !== undefined) out.lexiconKey = match.lexiconKey;
  if (match.tag !== undefined) out.tag = match.tag;
  if (match.ruleId !== undefined) out.ruleId = match.ruleId;
  return out as unknown as RuleMatch;
}

export function canonicalizeRule(rule: Rule): Rule {
  const out: Record<string, unknown> = {
    id: rule.id,
    category: rule.category,
  };
  if (rule.tier !== undefined) out.tier = rule.tier;
  if (rule.severity !== undefined) out.severity = rule.severity;
  if (rule.status !== undefined) out.status = rule.status;
  if (rule.riskLevel !== undefined) out.riskLevel = rule.riskLevel;
  out.priority = rule.priority;
  out.description = rule.description;
  out.match = canonicalizeMatch(rule.match);
  out.replacement = canonicalizeReplacement(rule.replacement);
  out.confidence = rule.confidence;
  out.autoApply = rule.autoApply;
  out.enabled = rule.enabled;
  if (rule.action !== undefined) out.action = rule.action;
  out.requires = rule.requires;
  out.guards = rule.guards;
  if (rule.provenance !== undefined) out.provenance = rule.provenance;
  if (rule.rationale !== undefined) out.rationale = rule.rationale;
  if (rule.notes !== undefined) out.notes = rule.notes;
  if (rule.examples !== undefined) out.examples = rule.examples;
  return out as unknown as Rule;
}

export function canonicalizeRulePack(pack: GrammarRulesSchema): GrammarRulesSchema {
  const out: Record<string, unknown> = {
    schemaVersion: pack.schemaVersion,
  };
  if (pack.packId !== undefined) out.packId = pack.packId;
  if (pack.packVersion !== undefined) out.packVersion = pack.packVersion;
  if (pack.generatedFrom !== undefined) out.generatedFrom = pack.generatedFrom;
  out.language = pack.language;
  out.purpose = pack.purpose;
  out.defaults = {
    autoApply: pack.defaults.autoApply,
    minAutoApplyConfidence: pack.defaults.minAutoApplyConfidence,
    dialect: pack.defaults.dialect,
  };
  out.rules = pack.rules.map(canonicalizeRule);
  return out as unknown as GrammarRulesSchema;
}

export function canonicalizeExceptionPack(pack: GrammarExceptionsSchema): GrammarExceptionsSchema {
  const out: Record<string, unknown> = {
    schemaVersion: pack.schemaVersion,
    purpose: pack.purpose,
    protectedSpanKinds: pack.protectedSpanKinds,
    globalGuards: pack.globalGuards.map((g) => ({
      id: g.id,
      condition: g.condition,
      action: g.action,
      reason: g.reason,
    })),
    dialectNotes: pack.dialectNotes,
    applicationNotes: pack.applicationNotes,
  };
  return out as unknown as GrammarExceptionsSchema;
}

export function serializeRulePack(pack: GrammarRulesSchema): string {
  return JSON.stringify(canonicalizeRulePack(pack), null, 2) + '\n';
}

export function serializeExceptionPack(pack: GrammarExceptionsSchema): string {
  return JSON.stringify(canonicalizeExceptionPack(pack), null, 2) + '\n';
}
