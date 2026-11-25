import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import type { Environment } from '../config/environment.js';
import { AccessTokenService } from './access-token.service.js';
import { SessionCookies } from './session-cookies.js';
import { Session, SessionSchema } from './session.schema.js';
import { SessionsService } from './sessions.service.js';

@Module({
   imports: [
      MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
      JwtModule.registerAsync({
         inject: [ConfigService],
         useFactory: (config: ConfigService<Environment, true>) => ({
            secret: config.get('JWT_ACCESS_SECRET', { infer: true }),
            signOptions: { algorithm: 'HS256', expiresIn: config.get('ACCESS_TOKEN_TTL_SECONDS', { infer: true }) },
            verifyOptions: { algorithms: ['HS256'] },
         }),
      }),
   ],
   providers: [SessionsService, AccessTokenService, SessionCookies],
   exports: [SessionsService, AccessTokenService, SessionCookies],
})
export class SessionsModule {}
