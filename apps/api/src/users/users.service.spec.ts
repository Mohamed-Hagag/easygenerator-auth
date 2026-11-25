import { ConflictException } from '@nestjs/common';
import type { Model } from 'mongoose';
import { describe, expect, it, vi } from 'vitest';

import type { User } from './user.schema.js';
import { UsersService } from './users.service.js';

const user = { email: 'jane@example.com', name: 'Jane', passwordHash: 'hash' };

describe('UsersService.create', () => {
   const create = vi.fn();
   const service = new UsersService({ create } as unknown as Model<User>);

   it('turns a duplicate key error (existing email or a race) into a conflict on the email field', async () => {
      create.mockRejectedValue(Object.assign(new Error('E11000'), { code: 11000 }));

      const error: unknown = await service.create(user).catch((reason: unknown) => reason);
      expect(error).toBeInstanceOf(ConflictException);
      expect((error as ConflictException).getResponse()).toMatchObject({ errors: { email: ['An account with this email already exists'] } });
   });

   it('does not hide other database errors', async () => {
      create.mockRejectedValue(new Error('connection lost'));
      await expect(service.create(user)).rejects.toThrow('connection lost');
   });
});
