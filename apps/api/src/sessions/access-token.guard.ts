import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedRequest } from '../common/authenticated-request.js';
import { IS_PUBLIC_KEY } from '../common/public.decorator.js';
import { AccessTokenService } from './access-token.service.js';
import { readAccessToken } from './session-cookies.js';
import { SessionsService } from './sessions.service.js';

@Injectable()
export class AccessTokenGuard implements CanActivate {
   constructor(
      private readonly reflector: Reflector,
      private readonly accessTokens: AccessTokenService,
      private readonly sessions: SessionsService,
   ) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
      if (isPublic) {
         return true;
      }

      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      const token = readAccessToken(request);
      const payload = token ? await this.accessTokens.verify(token) : null;

      // Checking the session too makes logout take effect before the access token expires.
      if (!payload || !(await this.sessions.isActive(payload.sid, payload.sub))) {
         throw new UnauthorizedException('Authentication required');
      }

      request.userId = payload.sub;
      return true;
   }
}
