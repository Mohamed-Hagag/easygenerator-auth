import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';

import type { Environment } from '../config/environment.js';
import { OriginGuard } from './origin.guard.js';

const guard = new OriginGuard({ get: () => 'http://localhost:5173/' } as unknown as ConfigService<Environment, true>);

const check = (method: string, origin?: string) =>
   guard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ method, headers: { origin } }) }) } as unknown as ExecutionContext);

describe('OriginGuard', () => {
   it.each([
      ['POST', 'http://localhost:5173'],
      ['POST', undefined],
      ['GET', 'https://evil.example'],
   ])('allows %s from %s', (method, origin) => {
      expect(check(method, origin)).toBe(true);
   });

   it.each(['https://evil.example', 'http://localhost:5173.evil.example', 'http://localhost:3000', 'null'])('rejects POST from %s', (origin) => {
      expect(() => check('POST', origin)).toThrow(ForbiddenException);
   });
});
