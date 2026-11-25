import { UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import type { PasswordService } from './password.service.js';

const user = { id: '1', email: 'jane@example.com', name: 'Jane', passwordHash: 'stored-hash' };
const credentials = { email: user.email, password: 'abcdef1!' };

describe('AuthService', () => {
   const users = { create: vi.fn(), findByEmailWithPassword: vi.fn() };
   const passwords = { hash: vi.fn(), verify: vi.fn() };
   const service = new AuthService(users as unknown as UsersService, passwords as unknown as PasswordService);

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
});
