import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SessionsService } from '../sessions/sessions.service.js';
import { AccessTokenGuard } from './access-token.guard.js';
import { AccessTokenService } from './access-token.service.js';
import { Public } from './public.decorator.js';

class TestController {
   @Public()
   open() {}

   closed() {}
}

const contextFor = (handler: 'open' | 'closed', request: object) =>
   ({
      getHandler: () => Object.getOwnPropertyDescriptor(TestController.prototype, handler)?.value as unknown,
      getClass: () => TestController,
      switchToHttp: () => ({ getRequest: () => request }),
   }) as unknown as ExecutionContext;

const jwtWith = (secret: string, expiresIn = 60) => new AccessTokenService(new JwtService({ secret, signOptions: { expiresIn } }));

describe('AccessTokenGuard', () => {
   const isActive = vi.fn();
   const tokens = jwtWith('test-secret');
   const guard = new AccessTokenGuard(new Reflector(), tokens, { isActive } as unknown as SessionsService);

   const expectRejected = (cookies: object) =>
      expect(guard.canActivate(contextFor('closed', { cookies }))).rejects.toThrow(new UnauthorizedException('Authentication required'));

   beforeEach(() => {
      isActive.mockReset().mockResolvedValue(true);
   });

   it('lets anyone use a public endpoint', async () => {
      await expect(guard.canActivate(contextFor('open', { cookies: {} }))).resolves.toBe(true);
   });

   it('accepts a valid token and sets the user id', async () => {
      const request = { cookies: { access_token: await tokens.sign('user', 'sid') }, userId: undefined };

      await expect(guard.canActivate(contextFor('closed', request))).resolves.toBe(true);
      expect(request.userId).toBe('user');
      expect(isActive).toHaveBeenCalledWith('sid', 'user');
   });

   it('rejects a missing, malformed or object cookie', async () => {
      await expectRejected({});
      await expectRejected({ access_token: 'nope' });
      await expectRejected({ access_token: { $ne: null } });
   });

   it('rejects a token signed with another secret', async () => {
      await expectRejected({ access_token: await jwtWith('other-secret').sign('user', 'sid') });
   });

   it('rejects an expired token', async () => {
      await expectRejected({ access_token: await jwtWith('test-secret', -1).sign('user', 'sid') });
   });

   it('rejects a valid token whose session was revoked', async () => {
      isActive.mockResolvedValue(false);
      await expectRejected({ access_token: await tokens.sign('user', 'sid') });
   });
});
