import { beforeAll, describe, expect, it } from 'vitest';

import { PasswordService } from './password.service.js';

describe('PasswordService', () => {
   const service = new PasswordService();

   beforeAll(() => service.onModuleInit());

   it('creates a salted argon2id hash', async () => {
      const [first, second] = await Promise.all([service.hash('abcdef1!'), service.hash('abcdef1!')]);
      expect(first).toMatch(/^\$argon2id\$/);
      expect(first).not.toBe(second);
   });

   it('verifies the right password and rejects a wrong one', async () => {
      const storedHash = await service.hash('abcdef1!');
      expect(await service.verify(storedHash, 'abcdef1!')).toBe(true);
      expect(await service.verify(storedHash, 'abcdef1?')).toBe(false);
   });

   it('rejects any password when there is no stored hash', async () => {
      expect(await service.verify(undefined, 'abcdef1!')).toBe(false);
   });
});
