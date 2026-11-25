import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type AccessTokenPayload = {
   /** User id. */
   sub: string;
   /** Session id. */
   sid: string;
};

@Injectable()
export class AccessTokenService {
   constructor(private readonly jwt: JwtService) {}

   sign(userId: string, sessionId: string): Promise<string> {
      const payload: AccessTokenPayload = { sub: userId, sid: sessionId };
      return this.jwt.signAsync(payload);
   }

   /** Returns null when the token is malformed, tampered with or expired. */
   async verify(token: string): Promise<AccessTokenPayload | null> {
      try {
         return await this.jwt.verifyAsync<AccessTokenPayload>(token);
      } catch {
         return null;
      }
   }
}
