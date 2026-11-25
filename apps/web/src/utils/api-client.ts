import { ApiError, toApiError } from 'utils/api-error';

const TIMEOUT_MS = 15_000;
const REFRESH_LOCK = 'auth-refresh';

type RequestOptions = {
   method?: 'GET' | 'POST';
   body?: unknown;
   /** Set to false where a 401 is a final answer (sign in, log out, ...) instead of an expired access token. */
   refreshOnUnauthorized?: boolean;
};

const send = async (path: string, { method = 'GET', body }: RequestOptions): Promise<Response> => {
   try {
      return await fetch(`/api${path}`, {
         method,
         credentials: 'same-origin',
         headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
         body: body === undefined ? undefined : JSON.stringify(body),
         signal: AbortSignal.timeout(TIMEOUT_MS),
      });
   } catch {
      throw new ApiError({ status: null, message: 'Could not reach the server. Check your connection and try again.' });
   }
};

/** Returns false only when the session is over. Other failures throw, so a network problem does not sign the user out. */
const requestRefresh = async (): Promise<boolean> => {
   const response = await send('/auth/refresh', { method: 'POST' });
   if (response.ok) {
      return true;
   }
   if (response.status === 401) {
      return false;
   }
   throw await toApiError(response);
};

// Refresh tokens work once and the API treats a second use as theft, so tabs must take turns.
// navigator.locks is missing on insecure origins (plain http other than localhost).
const refreshAcrossTabs = (): Promise<boolean> => ('locks' in navigator ? navigator.locks.request(REFRESH_LOCK, requestRefresh) : requestRefresh());

let pendingRefresh: Promise<boolean> | null = null;

/** Requests of this tab that fail at the same time share one refresh. */
const refreshSession = (): Promise<boolean> => {
   pendingRefresh ??= refreshAcrossTabs().finally(() => {
      pendingRefresh = null;
   });
   return pendingRefresh;
};

/** Sends a request to the API, refreshing the session once if the access token has expired. */
export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
   const { refreshOnUnauthorized = true } = options;

   let response = await send(path, options);
   if (response.status === 401 && refreshOnUnauthorized && (await refreshSession())) {
      response = await send(path, options);
   }

   if (!response.ok) {
      throw await toApiError(response);
   }
   return (response.status === 204 ? undefined : await response.json()) as T;
};
