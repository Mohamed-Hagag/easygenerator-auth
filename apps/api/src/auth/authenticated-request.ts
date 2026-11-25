import type { Request } from 'express';

/** The request after AccessTokenGuard accepted it. */
export type AuthenticatedRequest = Request & { userId: string };
