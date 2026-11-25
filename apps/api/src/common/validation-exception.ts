import { BadRequestException, type ValidationError } from '@nestjs/common';

export type FieldErrors = Record<string, string[]>;

/** Groups validation messages by field so the web app can show each one next to its input. */
export const createValidationException = (validationErrors: ValidationError[]): BadRequestException => {
   const errors: FieldErrors = Object.fromEntries(validationErrors.map((error) => [error.property, Object.values(error.constraints ?? {})]));
   return new BadRequestException({ message: 'Validation failed', errors });
};
