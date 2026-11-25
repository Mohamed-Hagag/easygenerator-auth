import { createHash } from 'node:crypto';

import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Model } from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Environment } from '../config/environment.js';
import type { Session } from './session.schema.js';
import { SessionsService } from './sessions.service.js';

const NOW = new Date('2026-01-01T00:00:00Z');
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const query = (result: unknown) => ({ exec: () => Promise.resolve(result) });

describe('SessionsService', () => {
   const model = { create: vi.fn(), findOneAndUpdate: vi.fn(), deleteOne: vi.fn(), exists: vi.fn() };
   const config = { get: () => 7 } as unknown as ConfigService<Environment, true>;
   const service = new SessionsService(model as unknown as Model<Session>, config);

   beforeEach(() => {
      vi.resetAllMocks();
      vi.useFakeTimers({ now: NOW });
      vi.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);
   });

   afterEach(() => {
      vi.useRealTimers();
   });

   it('creates a session that expires after the configured days and stores only a hash', async () => {
      const { id, refreshToken, expiresAt } = await service.create('user');
      const secret = refreshToken.slice(id.length + 1);

      expect(expiresAt).toEqual(new Date('2026-01-08T00:00:00Z'));
      expect(model.create).toHaveBeenCalledWith({ _id: id, userId: 'user', tokenHash: sha256(secret), expiresAt });
   });

   it('rotates only an unexpired session with the matching hash, without extending it', async () => {
      const expiresAt = new Date('2026-01-03T00:00:00Z');
      model.findOneAndUpdate.mockReturnValue(query({ userId: 'user', expiresAt }));

      const result = await service.rotate('sid.secret');
      const nextSecret = result?.refreshToken.split('.')[1] ?? '';

      expect(result).toMatchObject({ id: 'sid', userId: 'user', expiresAt });
      expect(nextSecret).not.toBe('secret');
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
         { _id: 'sid', tokenHash: sha256('secret'), expiresAt: { $gt: NOW } },
         { tokenHash: sha256(nextSecret) },
      );
      expect(model.deleteOne).not.toHaveBeenCalled();
   });

   it('revokes the whole session when a token is reused', async () => {
      model.findOneAndUpdate.mockReturnValue(query(null));
      model.deleteOne.mockReturnValue(query({ deletedCount: 1 }));

      await expect(service.rotate('sid.used')).resolves.toBeNull();
      expect(model.deleteOne).toHaveBeenCalledWith({ _id: 'sid' });
   });

   it.each(['', 'sid', 'sid.', '.secret', 'a.b.c'])('ignores malformed token %j', async (token) => {
      await expect(service.rotate(token)).resolves.toBeNull();
      await service.revoke(token);
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();
      expect(model.deleteOne).not.toHaveBeenCalled();
   });

   it('revokes a session', async () => {
      model.deleteOne.mockReturnValue(query({ deletedCount: 1 }));
      await service.revoke('sid.secret');
      expect(model.deleteOne).toHaveBeenCalledWith({ _id: 'sid' });
   });

   it.each([
      [{ _id: 'sid' }, true],
      [null, false],
   ])('is active when an unexpired session of that user is found (%j)', async (found, expected) => {
      model.exists.mockReturnValue(query(found));
      await expect(service.isActive('sid', 'user')).resolves.toBe(expected);
      expect(model.exists).toHaveBeenCalledWith({ _id: 'sid', userId: 'user', expiresAt: { $gt: NOW } });
   });
});
