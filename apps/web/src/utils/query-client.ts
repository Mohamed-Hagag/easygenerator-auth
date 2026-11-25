import { QueryClient } from '@tanstack/react-query';

import { ApiError } from 'utils/api-error';

const MAX_RETRIES = 2;

/** Retries only failures that may be temporary: no connection or a server error. */
const shouldRetry = (failureCount: number, error: Error): boolean => {
   const isTemporary = error instanceof ApiError && (error.status === null || error.status >= 500);
   return isTemporary && failureCount < MAX_RETRIES;
};

export const queryClient = new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } });
