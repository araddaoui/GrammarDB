import { GrammarExceptionsSchema, GrammarRulesSchema } from './types';
import {
  canonicalizeExceptionPack,
  canonicalizeRulePack,
  validateExceptionsPack,
  validateRulePack,
} from './ruleSchema';
import { CANONICAL_ENGINE_VERSION, PORTABLE_BUNDLE_VERSION, majorOf } from './version';
import { RuleStore } from './ruleStore';

/**
 * Highest engine API major this bundle format is designed for. A consumer must
 * declare the same major before the bundle may be adopted.
 */
export const PORTABLE_BUNDLE_ENGINE_MAJOR = majorOf(CANONICAL_ENGINE_VERSION);

export type ExportScope = 'stable' | 'all';

export interface PortableGrammarBundle {
  bundleVersion: string;
  engineApiVersion: string;
  packId: string;
  packVersion: string;
  rulePack: GrammarRulesSchema;
  exceptionPack: GrammarExceptionsSchema;
  exports: {
    scope: ExportScope;
    exportedRuleIds: string[];
    excludedRuleIds: string[];
    counts: { total: number; exported: number; excluded: number };
  };
  manifest: {
    checksum: string;
    algorithm: 'fnv1a32';
  };
}

export interface BuildBundleOptions {
  /** Which rules to include. Defaults to `stable` — the migration-safe subset. */
  scope?: ExportScope;
}

/**
 * FNV-1a 32-bit digest. Deterministic, dependency-free, and sufficient for
 * tamper/consistency detection of a JSON artifact (not a security primitive).
 */
export function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function coreForChecksum(bundle: Omit<PortableGrammarBundle, 'manifest'>): string {
  return JSON.stringify({
    bundleVersion: bundle.bundleVersion,
    engineApiVersion: bundle.engineApiVersion,
    packId: bundle.packId,
    packVersion: bundle.packVersion,
    rulePack: canonicalizeRulePack(bundle.rulePack),
    exceptionPack: canonicalizeExceptionPack(bundle.exceptionPack),
    exports: bundle.exports,
  });
}

export function computeBundleChecksum(bundle: Omit<PortableGrammarBundle, 'manifest'>): string {
  return fnv1a32(coreForChecksum(bundle));
}

function restrictPack(pack: GrammarRulesSchema, ids: Set<string>): GrammarRulesSchema {
  return {
    ...pack,
    rules: pack.rules.filter((r) => ids.has(r.id)),
  };
}

/**
 * Builds a self-contained, versioned artifact from a validated rule store. This
 * is the ONLY thing intended to cross into a consumer. Nothing here touches or
 * assumes anything about IdiomOptima's code.
 */
export function buildPortableBundle(store: RuleStore, options: BuildBundleOptions = {}): PortableGrammarBundle {
  const scope: ExportScope = options.scope ?? 'stable';
  const pack = store.getPack();

  const exported = store.getExportableRules(scope);
  const exportedIds = new Set(exported.map((r) => r.id));
  const excludedRuleIds = pack.rules.filter((r) => !exportedIds.has(r.id)).map((r) => r.id);

  const restricted = restrictPack(pack, exportedIds);
  const ruleDiag = validateRulePack(restricted);
  if (!ruleDiag.isValid) {
    throw new Error(`Restricted rule pack failed validation: ${ruleDiag.errors.join('; ')}`);
  }

  const core = {
    bundleVersion: PORTABLE_BUNDLE_VERSION,
    engineApiVersion: CANONICAL_ENGINE_VERSION,
    packId: pack.packId ?? 'unknown',
    packVersion: pack.packVersion ?? pack.schemaVersion,
    rulePack: restricted,
    exceptionPack: store.getExceptions(),
    exports: {
      scope,
      exportedRuleIds: exported.map((r) => r.id),
      excludedRuleIds,
      counts: {
        total: pack.rules.length,
        exported: exported.length,
        excluded: excludedRuleIds.length,
      },
    },
  };

  const bundle: PortableGrammarBundle = {
    ...core,
    manifest: { checksum: computeBundleChecksum(core), algorithm: 'fnv1a32' },
  };
  return bundle;
}

export interface BundleVerification {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export function verifyPortableBundle(bundle: PortableGrammarBundle, consumerEngineMajor: number = PORTABLE_BUNDLE_ENGINE_MAJOR): BundleVerification {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!bundle || typeof bundle !== 'object') {
    return { ok: false, errors: ['Bundle is not an object'], warnings };
  }
  if (majorOf(CANONICAL_ENGINE_VERSION) !== majorOf(bundle.engineApiVersion)) {
    warnings.push('Bundle was produced by a different engine API major');
  }
  if (consumerEngineMajor !== majorOf(bundle.engineApiVersion)) {
    errors.push(
      `Consumer supports engine API major ${consumerEngineMajor}, bundle requires ${majorOf(bundle.engineApiVersion)}`
    );
  }

  const ruleDiag = validateRulePack(bundle.rulePack);
  const exDiag = validateExceptionsPack(bundle.exceptionPack);
  errors.push(...ruleDiag.errors, ...exDiag.errors);
  warnings.push(...ruleDiag.warnings, ...exDiag.warnings);

  const { manifest, ...core } = bundle;
  const expected = computeBundleChecksum(core);
  if (!manifest || manifest.checksum !== expected) {
    errors.push(`Checksum mismatch: expected ${expected}, got ${manifest?.checksum ?? '<missing>'}`);
  }

  // Only stable rules may auto-apply in a consumer. A `stable`-scope bundle
  // must uphold this as a hard invariant; an `all`-scope (diagnostic) bundle
  // only warns, since it is explicitly not intended for adoption as-is.
  for (const rule of bundle.rulePack.rules) {
    if (rule.autoApply && rule.status !== 'stable') {
      const message = `Rule ${rule.id} is autoApply but status is "${rule.status ?? 'undefined'}" (must be stable)`;
      if (bundle.exports?.scope === 'stable') errors.push(message);
      else warnings.push(message);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function serializeBundle(bundle: PortableGrammarBundle): string {
  return JSON.stringify(bundle, null, 2) + '\n';
}

export function parseBundle(json: string): PortableGrammarBundle {
  return JSON.parse(json) as PortableGrammarBundle;
}
