import { Injectable, UnauthorizedException } from '@nestjs/common';

import { type IssuedSession, SessionsService } from '../sessions/sessions.service.js';
import type { UserDocument } from '../users/user.schema.js';
import { UsersService } from '../users/users.service.js';
import { AccessTokenService } from './access-token.service.js';
import type { SignInDto } from './dto/sign-in.dto.js';
import type { SignUpDto } from './dto/sign-up.dto.js';
import { PasswordService } from './password.service.js';

export type AuthTokens = {
   accessToken: string;
   refreshToken: string;
   refreshExpiresAt: Date;
};

@Injectable()
export class AuthService {
   constructor(
      private readonly users: UsersService,
      private readonly passwords: PasswordService,
      private readonly sessions: SessionsService,
      private readonly accessTokens: AccessTokenService,
   ) {}

   async signUp({ email, name, password }: SignUpDto): Promise<UserDocument> {
      const passwordHash = await this.passwords.hash(password);
      return this.users.create({ email, name, passwordHash });
   }

   async signIn({ email, password }: SignInDto): Promise<UserDocument> {
      const user = await this.users.findByEmailWithPassword(email);
      const matches = await this.passwords.verify(user?.passwordHash, password);

      if (!user || !matches) {
         throw new UnauthorizedException('Invalid email or password');
      }
      return user;
   }

   /** Starts a session, replacing the one this browser already had (if any). */
   async startSession(userId: string, previousRefreshToken: string | null): Promise<AuthTokens> {
      await this.endSession(previousRefreshToken);
      return this.toTokens(await this.sessions.create(userId));
   }

   /** Returns null when the session cannot be continued. */
   async refreshSession(refreshToken: string | null): Promise<AuthTokens | null> {
      const session = refreshToken ? await this.sessions.rotate(refreshToken) : null;
      return session ? this.toTokens(session) : null;
   }

   async endSession(refreshToken: string | null): Promise<void> {
      if (refreshToken) {
         await this.sessions.revoke(refreshToken);
      }
   }

   private async toTokens({ id, userId, refreshToken, expiresAt }: IssuedSession): Promise<AuthTokens> {
      return { accessToken: await this.accessTokens.sign(userId, id), refreshToken, refreshExpiresAt: expiresAt };
   }
}
