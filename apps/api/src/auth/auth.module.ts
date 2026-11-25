import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import type { Environment } from '../config/environment.js';
import { SessionsModule } from '../sessions/sessions.module.js';
import { UsersModule } from '../users/users.module.js';
import { AccessTokenService } from './access-token.service.js';
import { AuthCookies } from './auth-cookies.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PasswordService } from './password.service.js';

@Module({
   imports: [
      UsersModule,
      SessionsModule,
      JwtModule.registerAsync({
         inject: [ConfigService],
         useFactory: (config: ConfigService<Environment, true>) => ({
            secret: config.get('JWT_ACCESS_SECRET', { infer: true }),
            signOptions: { algorithm: 'HS256', expiresIn: config.get('ACCESS_TOKEN_TTL_SECONDS', { infer: true }) },
            verifyOptions: { algorithms: ['HS256'] },
         }),
      }),
   ],
   controllers: [AuthController],
   providers: [AuthService, PasswordService, AccessTokenService, AuthCookies],
   // Used by the global AccessTokenGuard in AppModule.
   exports: [AccessTokenService, SessionsModule],
})
export class AuthModule {}
