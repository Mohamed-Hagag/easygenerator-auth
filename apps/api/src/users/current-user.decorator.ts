import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.js';

/** The signed-in user's id. Only for endpoints that are not @Public(). */
export const CurrentUserId = createParamDecorator(
   (_data: unknown, context: ExecutionContext): string => context.switchToHttp().getRequest<AuthenticatedRequest>().userId,
);
