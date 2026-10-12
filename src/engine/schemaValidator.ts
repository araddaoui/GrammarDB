import { GrammarRulesSchema, GrammarExceptionsSchema } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateRulesSchema(schema: any): ValidationResult {
  const errors: string[] = [];

  if (!schema || typeof schema !== 'object') {
    return { isValid: false, errors: ['Rules schema root must be an object'] };
  }

  if (typeof schema.schemaVersion !== 'string' || !schema.schemaVersion.trim()) {
    errors.push('Missing or invalid schemaVersion');
  }

  if (!Array.isArray(schema.rules)) {
    errors.push('Schema rules property must be an array');
    return { isValid: false, errors };
  }

  schema.rules.forEach((rule: any, idx: number) => {
    if (!rule || typeof rule !== 'object') {
      errors.push(`Rule at index ${idx} is not an object`);
      return;
    }
    if (!rule.id || typeof rule.id !== 'string') {
      errors.push(`Rule at index ${idx} is missing a string id`);
    }
    if (!rule.category || typeof rule.category !== 'string') {
      errors.push(`Rule ${rule.id || idx} is missing category`);
    }
    if (!rule.match || typeof rule.match !== 'object') {
      errors.push(`Rule ${rule.id || idx} is missing match object`);
    } else {
      if (!rule.match.type || typeof rule.match.type !== 'string') {
        errors.push(`Rule ${rule.id || idx} match is missing string type`);
      }
    }
    if (typeof rule.confidence !== 'number' || rule.confidence < 0 || rule.confidence > 1) {
      errors.push(`Rule ${rule.id || idx} confidence must be a number between 0 and 1`);
    }
    if (typeof rule.priority !== 'number') {
      errors.push(`Rule ${rule.id || idx} priority must be a number`);
    }
    if (typeof rule.enabled !== 'boolean') {
      errors.push(`Rule ${rule.id || idx} enabled property must be a boolean`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateExceptionsSchema(schema: any): ValidationResult {
  const errors: string[] = [];

  if (!schema || typeof schema !== 'object') {
    return { isValid: false, errors: ['Exceptions schema root must be an object'] };
  }

  if (typeof schema.schemaVersion !== 'string' || !schema.schemaVersion.trim()) {
    errors.push('Missing or invalid schemaVersion');
  }

  if (!Array.isArray(schema.protectedSpanKinds)) {
    errors.push('protectedSpanKinds must be an array of strings');
  }

  if (!Array.isArray(schema.globalGuards)) {
    errors.push('globalGuards must be an array');
  } else {
    schema.globalGuards.forEach((guard: any, idx: number) => {
      if (!guard.id || !guard.condition || !guard.action || !guard.reason) {
        errors.push(`Global guard at index ${idx} is missing required fields (id, condition, action, reason)`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
