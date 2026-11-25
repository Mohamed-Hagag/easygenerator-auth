import { randomBytes } from 'node:crypto';

import { Injectable, type OnModuleInit } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';

// OWASP-recommended minimum for argon2id, the library's default algorithm.
const HASH_OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

@Injectable()
export class PasswordService implements OnModuleInit {
   private dummyHash: string;

   async onModuleInit(): Promise<void> {
      this.dummyHash = await this.hash(randomBytes(32).toString('hex'));
   }

   hash(password: string): Promise<string> {
      return hash(password, HASH_OPTIONS);
   }

   /** Without a stored hash it still does the same work, so response time does not reveal whether an account exists. */
   async verify(storedHash: string | undefined, password: string): Promise<boolean> {
      const matches = await verify(storedHash ?? this.dummyHash, password);
      return storedHash !== undefined && matches;
   }
}
