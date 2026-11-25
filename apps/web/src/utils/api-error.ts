export type FieldErrors = Record<string, string[]>;

type ApiErrorOptions = {
   /** HTTP status, or null when the server could not be reached. */
   status: number | null;
   message: string;
   fieldErrors?: FieldErrors;
};

export class ApiError extends Error {
   readonly status: number | null;
   readonly fieldErrors: FieldErrors;

   constructor({ status, message, fieldErrors = {} }: ApiErrorOptions) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.fieldErrors = fieldErrors;
   }
}

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const toFieldErrors = (value: unknown): FieldErrors => {
   if (!isRecord(value)) {
      return {};
   }
   const entries = Object.entries(value).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].every((message) => typeof message === 'string'),
   );
   return Object.fromEntries(entries);
};

/** Reads the API's error format, and copes with other bodies such as a proxy's error page. */
export const toApiError = async (response: Response): Promise<ApiError> => {
   const body: unknown = await response.json().catch(() => null);
   const isApiBody = isRecord(body) && typeof body.message === 'string' && response.status < 500;

   return new ApiError({
      status: response.status,
      message: isApiBody ? (body.message as string) : FALLBACK_MESSAGE,
      fieldErrors: isApiBody ? toFieldErrors(body.errors) : {},
   });
};
