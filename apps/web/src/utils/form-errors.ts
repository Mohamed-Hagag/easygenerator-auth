import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { ApiError } from 'utils/api-error';

/** Shows API field errors next to their inputs, and anything else as an alert above the form (errors.root). */
export const applySubmitError = <T extends FieldValues>(error: unknown, fields: Path<T>[], setError: UseFormSetError<T>): void => {
   const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
   const invalidFields = fields.filter((field) => fieldErrors[field]?.length);

   invalidFields.forEach((field, index) => {
      setError(field, { type: 'server', message: fieldErrors[field][0] }, { shouldFocus: index === 0 });
   });

   if (invalidFields.length === 0) {
      setError('root', { type: 'server', message: error instanceof ApiError ? error.message : 'Something went wrong. Please try again.' });
   }
};
