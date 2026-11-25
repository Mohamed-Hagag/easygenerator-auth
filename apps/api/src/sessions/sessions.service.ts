import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { Environment } from '../config/environment.js';
import { Session } from './session.schema.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export type IssuedSession = {
   id: string;
   userId: string;
   /** Sent to the browser once; only its hash is stored. */
   refreshToken: string;
   expiresAt: Date;
};

// A random 256-bit secret cannot be guessed, so a fast hash is enough here (unlike for passwords).
const hashSecret = (secret: string): string => createHash('sha256').update(secret).digest('hex');

const createSecret = (): string => randomBytes(32).toString('base64url');

/** Refresh tokens look like "<session id>.<secret>". */
const parseToken = (token: string): { id: string; secret: string } | null => {
   const [id, secret, ...rest] = token.split('.');
   return id && secret && rest.length === 0 ? { id, secret } : null;
};

@Injectable()
export class SessionsService {
   private readonly logger = new Logger(SessionsService.name);
   private readonly lifetimeMs: number;

   constructor(
      @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
      config: ConfigService<Environment, true>,
   ) {
      this.lifetimeMs = config.get('REFRESH_TOKEN_TTL_DAYS', { infer: true }) * DAY_MS;
   }

   async create(userId: string): Promise<IssuedSession> {
      const id = randomUUID();
      const secret = createSecret();
      const expiresAt = new Date(Date.now() + this.lifetimeMs);
      await this.sessionModel.create({ _id: id, userId, tokenHash: hashSecret(secret), expiresAt });
      return { id, userId, refreshToken: `${id}.${secret}`, expiresAt };
   }

   /** Swaps a valid refresh token for a new one. Returns null when the token is invalid, expired or already used. */
   async rotate(refreshToken: string): Promise<IssuedSession | null> {
      const parsed = parseToken(refreshToken);
      if (!parsed) {
         return null;
      }

      const { id, secret } = parsed;
      const nextSecret = createSecret();
      // Matching the current hash in the same operation lets only one of several parallel requests succeed.
      const session = await this.sessionModel
         .findOneAndUpdate({ _id: id, tokenHash: hashSecret(secret), expiresAt: { $gt: new Date() } }, { tokenHash: hashSecret(nextSecret) })
         .exec();

      if (!session) {
         // A known session with another token means this token was already used, so it may have been stolen.
         const { deletedCount } = await this.sessionModel.deleteOne({ _id: id }).exec();
         if (deletedCount > 0) {
            this.logger.warn('Session revoked: expired or already used refresh token');
         }
         return null;
      }

      return { id, userId: session.userId.toString(), refreshToken: `${id}.${nextSecret}`, expiresAt: session.expiresAt };
   }

   async revoke(refreshToken: string): Promise<void> {
      const parsed = parseToken(refreshToken);
      if (parsed) {
         await this.sessionModel.deleteOne({ _id: parsed.id }).exec();
      }
   }

   async isActive(id: string, userId: string): Promise<boolean> {
      const session = await this.sessionModel.exists({ _id: id, userId, expiresAt: { $gt: new Date() } }).exec();
      return session !== null;
   }
}
