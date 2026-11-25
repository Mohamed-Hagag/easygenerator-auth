import type { TransformFnParams } from 'class-transformer';

// Non-string values are left as they are, so the validators can reject them.

export const trim = ({ value }: TransformFnParams): unknown => (typeof value === 'string' ? value.trim() : value);

export const normalizeEmail = ({ value }: TransformFnParams): unknown => (typeof value === 'string' ? value.trim().toLowerCase() : value);
