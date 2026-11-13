import { GrammarExceptionsSchema, GrammarRulesSchema, Rule, RuleStatus } from './types';
import {
  SchemaDiagnostics,
  validateExceptionsPack,
  validateRulePack,
} from './ruleSchema';

export class RulePackError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`Invalid rule pack:\n - ${errors.join('\n - ')}`);
    this.name = 'RulePackError';
    this.errors = errors;
  }
}

export interface RuleStoreStats {
  totalRules: number;
  enabledRules: number;
  autoApplyRules: number;
  stableRules: number;
  experimentalRules: number;
  candidateRules: number;
  deprecatedRules: number;
  byCategory: Record<string, number>;
}

export interface RuleStoreDiagnostics {
  rules: SchemaDiagnostics;
  exceptions: SchemaDiagnostics;
}

/**
 * Immutable, validated index over a canonical rule pack. Construction is
 * fail-closed: an invalid pack throws and no rules are exposed. Consumers that
 * prefer a non-throwing path should use {@link tryCreateRuleStore}.
 */
export class RuleStore {
  private readonly pack: GrammarRulesSchema;
  private readonly exceptions: GrammarExceptionsSchema;
  private readonly byId: Map<string, Rule>;

  private constructor(pack: GrammarRulesSchema, exceptions: GrammarExceptionsSchema, diagnostics: RuleStoreDiagnostics) {
    this.pack = pack;
    this.exceptions = exceptions;
    this.byId = new Map(pack.rules.map((r) => [r.id, r]));
    this.diagnostics = diagnostics;
  }

  readonly diagnostics: RuleStoreDiagnostics;

  static create(pack: GrammarRulesSchema, exceptions: GrammarExceptionsSchema): RuleStore {
    const ruleDiag = validateRulePack(pack);
    const exDiag = validateExceptionsPack(exceptions);
    if (!ruleDiag.isValid || !exDiag.isValid) {
      throw new RulePackError([...ruleDiag.errors, ...exDiag.errors]);
    }
    return new RuleStore(pack, exceptions, { rules: ruleDiag, exceptions: exDiag });
  }

  getPack(): GrammarRulesSchema {
    return this.pack;
  }

  getExceptions(): GrammarExceptionsSchema {
    return this.exceptions;
  }

  getRules(): Rule[] {
    return this.pack.rules;
  }

  getEnabledRules(): Rule[] {
    return this.pack.rules.filter((r) => r.enabled && r.status !== 'deprecated');
  }

  getRule(id: string): Rule | undefined {
    return this.byId.get(id);
  }

  /** Rules eligible to be exported to a consumer for the requested tier. */
  getExportableRules(include: 'stable' | 'all' = 'stable'): Rule[] {
    if (include === 'all') {
      return this.pack.rules.filter((r) => r.status !== 'deprecated');
    }
    return this.pack.rules.filter((r) => r.status === 'stable');
  }

  stats(): RuleStoreStats {
    const byCategory: Record<string, number> = {};
    let enabledRules = 0;
    let autoApplyRules = 0;
    const statusCounts: Record<RuleStatus, number> = {
      stable: 0,
      experimental: 0,
      candidate: 0,
      deprecated: 0,
    };
    for (const rule of this.pack.rules) {
      byCategory[rule.category] = (byCategory[rule.category] ?? 0) + 1;
      if (rule.enabled) enabledRules++;
      if (rule.autoApply) autoApplyRules++;
      const status: RuleStatus = rule.status ?? 'experimental';
      statusCounts[status] = (statusCounts[status] ?? 0) + 1;
    }
    return {
      totalRules: this.pack.rules.length,
      enabledRules,
      autoApplyRules,
      stableRules: statusCounts.stable,
      experimentalRules: statusCounts.experimental,
      candidateRules: statusCounts.candidate,
      deprecatedRules: statusCounts.deprecated,
      byCategory,
    };
  }
}

export interface TryCreateResult {
  store: RuleStore | null;
  diagnostics: RuleStoreDiagnostics;
  errors: string[];
}

/** Non-throwing construction: returns a null store when the pack is invalid. */
export function tryCreateRuleStore(pack: GrammarRulesSchema, exceptions: GrammarExceptionsSchema): TryCreateResult {
  const ruleDiag = validateRulePack(pack);
  const exDiag = validateExceptionsPack(exceptions);
  const errors = [...ruleDiag.errors, ...exDiag.errors];
  const diagnostics: RuleStoreDiagnostics = { rules: ruleDiag, exceptions: exDiag };
  if (errors.length > 0) {
    return { store: null, diagnostics, errors };
  }
  return { store: RuleStore.create(pack, exceptions), diagnostics, errors: [] };
}
