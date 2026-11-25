import { UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccessTokenService } from '../sessions/access-token.service.js';
import type { SessionsService } from '../sessions/sessions.service.js';
import type { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import type { PasswordService } from './password.service.js';

const user = { id: '1', email: 'jane@example.com', name: 'Jane', passwordHash: 'stored-hash' };
const credentials = { email: user.email, password: 'abcdef1!' };

describe('AuthService', () => {
   const users = { create: vi.fn(), findByEmailWithPassword: vi.fn() };
   const passwords = { hash: vi.fn(), verify: vi.fn() };
   const sessions = { create: vi.fn(), rotate: vi.fn(), revoke: vi.fn() };
   const accessTokens = { sign: vi.fn() };
   const service = new AuthService(
      users as unknown as UsersService,
      passwords as unknown as PasswordService,
      sessions as unknown as SessionsService,
      accessTokens as unknown as AccessTokenService,
   );

   beforeEach(() => {
      vi.resetAllMocks();
   });

   it('signs up with the hash instead of the password', async () => {
      passwords.hash.mockResolvedValue('new-hash');
      users.create.mockResolvedValue(user);

      await expect(service.signUp({ ...credentials, name: user.name })).resolves.toBe(user);
      expect(users.create).toHaveBeenCalledWith({ email: user.email, name: user.name, passwordHash: 'new-hash' });
   });

   it('signs in with the right password', async () => {
      users.findByEmailWithPassword.mockResolvedValue(user);
      passwords.verify.mockResolvedValue(true);

      await expect(service.signIn(credentials)).resolves.toBe(user);
      expect(passwords.verify).toHaveBeenCalledWith('stored-hash', credentials.password);
   });

   it('rejects a wrong password', async () => {
      users.findByEmailWithPassword.mockResolvedValue(user);
      passwords.verify.mockResolvedValue(false);

      await expect(service.signIn(credentials)).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
   });

   it('rejects an unknown email with the same error, after still verifying', async () => {
      users.findByEmailWithPassword.mockResolvedValue(null);
      passwords.verify.mockResolvedValue(false);

      await expect(service.signIn(credentials)).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
      expect(passwords.verify).toHaveBeenCalledWith(undefined, credentials.password);
   });

   describe('sessions', () => {
      const session = { id: 'sid', userId: '1', refreshToken: 'sid.new', expiresAt: new Date('2030-01-01') };
      const tokens = { accessToken: 'jwt', refreshToken: 'sid.new', refreshExpiresAt: session.expiresAt };

      beforeEach(() => {
         accessTokens.sign.mockResolvedValue('jwt');
      });

      it('starts a session and revokes the previous one of this browser', async () => {
         sessions.create.mockResolvedValue(session);

         await expect(service.startSession('1', 'old.token')).resolves.toEqual(tokens);
         expect(sessions.revoke).toHaveBeenCalledWith('old.token');
         expect(accessTokens.sign).toHaveBeenCalledWith('1', 'sid');
      });

      it('refreshes a valid session', async () => {
         sessions.rotate.mockResolvedValue(session);
         await expect(service.refreshSession('sid.old')).resolves.toEqual(tokens);
      });

      it('does not refresh without a token or with a rejected one', async () => {
         sessions.rotate.mockResolvedValue(null);

         await expect(service.refreshSession(null)).resolves.toBeNull();
         await expect(service.refreshSession('sid.used')).resolves.toBeNull();
         expect(accessTokens.sign).not.toHaveBeenCalled();
      });

      it('ends a session, and does nothing without a token', async () => {
         await service.endSession(null);
         expect(sessions.revoke).not.toHaveBeenCalled();

         await service.endSession('sid.current');
         expect(sessions.revoke).toHaveBeenCalledWith('sid.current');
      });
   });
});
