import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from './auth/auth.module.js';
import { createLoggerParams } from './common/logger.config.js';
import { OriginGuard } from './common/origin.guard.js';
import { type Environment, validateEnvironment } from './config/environment.js';
import { HealthController } from './health/health.controller.js';
import { AccessTokenGuard } from './sessions/access-token.guard.js';
import { SessionsModule } from './sessions/sessions.module.js';

@Module({
   imports: [
      // The .env file lives in the repository root; npm runs workspace scripts from apps/api.
      ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env', validate: validateEnvironment }),
      LoggerModule.forRootAsync({ inject: [ConfigService], useFactory: createLoggerParams }),
      MongooseModule.forRootAsync({
         inject: [ConfigService],
         useFactory: (config: ConfigService<Environment, true>) => ({ uri: config.get('MONGODB_URI', { infer: true }) }),
      }),
      // Default limit per IP address and endpoint; the auth endpoints set stricter ones.
      ThrottlerModule.forRoot({ throttlers: [{ limit: 100, ttl: 60_000 }], errorMessage: 'Too many requests, try again later' }),
      AuthModule,
      // Needed by the global AccessTokenGuard below.
      SessionsModule,
   ],
   controllers: [HealthController],
   // Run in this order on every endpoint.
   providers: [
      { provide: APP_GUARD, useClass: ThrottlerGuard },
      { provide: APP_GUARD, useClass: OriginGuard },
      { provide: APP_GUARD, useClass: AccessTokenGuard },
   ],
})
export class AppModule {}
