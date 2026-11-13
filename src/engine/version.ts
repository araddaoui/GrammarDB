/**
 * Versioning for the portable grammar layer. These strings travel inside every
 * exported bundle so a consumer (IdiomOptima) can assert compatibility *before*
 * adopting anything. Increment with intent:
 *
 *  - CANONICAL_ENGINE_VERSION: runtime behaviour of the engine (pipeline/semantics).
 *  - CANONICAL_PACK_VERSION:    contents of the derived rule pack.
 *  - PORTABLE_BUNDLE_VERSION:   shape of the migration artifact itself.
 */
export const CANONICAL_ENGINE_VERSION = '0.2.0';
export const CANONICAL_PACK_ID = 'idiomoptima.grammar.core';
export const CANONICAL_PACK_VERSION = '0.2.0';
export const PORTABLE_BUNDLE_VERSION = '0.2.0';

/** Major version a consumer must support to load a bundle. */
export function majorOf(version: string): number {
  const n = parseInt(version.split('.')[0] ?? '0', 10);
  return Number.isFinite(n) ? n : 0;
}
