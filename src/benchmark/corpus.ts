import { BenchmarkCase, BenchmarkCorpus, CorpusSplit, GoldEdit } from './types';

const VALID_SPLITS: CorpusSplit[] = ['clean', 'mechanical', 'guard', 'parser'];
const VALID_MODES = ['autoApply', 'suggest', 'shadow'];

export class CorpusValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`Invalid benchmark corpus:\n - ${errors.join('\n - ')}`);
    this.name = 'CorpusValidationError';
    this.errors = errors;
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function validateCorpus(value: unknown): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!isObject(value)) return { ok: false, errors: ['corpus root must be an object'] };
  if (typeof value.corpusId !== 'string' || !value.corpusId.trim()) errors.push('corpusId must be a non-empty string');
  if (typeof value.version !== 'string' || !value.version.trim()) errors.push('version must be a non-empty string');
  if (typeof value.description !== 'string') errors.push('description must be a string');
  if (!Array.isArray(value.cases)) {
    errors.push('cases must be an array');
    return { ok: errors.length === 0, errors };
  }

  const seen = new Set<string>();
  value.cases.forEach((c: unknown, idx: number) => {
    if (!isObject(c)) {
      errors.push(`case[${idx}] must be an object`);
      return;
    }
    const id = typeof c.id === 'string' ? c.id : `#${idx}`;
    if (typeof c.id !== 'string' || !c.id.trim()) errors.push(`case[${idx}] missing id`);
    else if (seen.has(c.id)) errors.push(`duplicate case id "${c.id}"`);
    else seen.add(c.id);

    if (typeof c.split !== 'string' || !VALID_SPLITS.includes(c.split as CorpusSplit)) {
      errors.push(`case ${id} split must be one of ${VALID_SPLITS.join(', ')}`);
    }
    if (typeof c.input !== 'string') errors.push(`case ${id} input must be a string`);
    if (typeof c.expectedOutput !== 'string') errors.push(`case ${id} expectedOutput must be a string`);
    if (c.mode !== undefined && !VALID_MODES.includes(c.mode as string)) {
      errors.push(`case ${id} mode must be one of ${VALID_MODES.join(', ')}`);
    }
    if (!Array.isArray(c.goldEdits)) {
      errors.push(`case ${id} goldEdits must be an array`);
    } else {
      c.goldEdits.forEach((g: unknown, gIdx: number) => {
        if (!isObject(g)) {
          errors.push(`case ${id} goldEdits[${gIdx}] must be an object`);
          return;
        }
        if (typeof g.original !== 'string') errors.push(`case ${id} goldEdits[${gIdx}].original must be a string`);
        if (typeof g.replacement !== 'string') errors.push(`case ${id} goldEdits[${gIdx}].replacement must be a string`);
      });
    }
    if (c.forbiddenSubstrings !== undefined) {
      if (!Array.isArray(c.forbiddenSubstrings) || c.forbiddenSubstrings.some((s: unknown) => typeof s !== 'string')) {
        errors.push(`case ${id} forbiddenSubstrings must be an array of strings`);
      }
    }
  });

  return { ok: errors.length === 0, errors };
}

export function parseCorpus(value: unknown): BenchmarkCorpus {
  const result = validateCorpus(value);
  if (!result.ok) throw new CorpusValidationError(result.errors);
  return value as BenchmarkCorpus;
}

export function caseGoldEdits(c: BenchmarkCase): GoldEdit[] {
  return c.goldEdits ?? [];
}
