import { ValidateBy } from 'class-validator';

/**
 * Like class-validator's Matches, but with its own name per rule. Errors are keyed by rule name, so several Matches on one
 * property would overwrite each other and only one message would be reported.
 */
export const Contains = (ruleName: string, pattern: RegExp, message: string): PropertyDecorator =>
   ValidateBy({ name: ruleName, validator: { validate: (value: unknown) => typeof value === 'string' && pattern.test(value) } }, { message });
