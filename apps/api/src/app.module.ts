import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { type Environment, validateEnvironment } from './config/environment.js';
import { HealthController } from './health/health.controller.js';

@Module({
   imports: [
      // The .env file lives in the repository root; npm runs workspace scripts from apps/api.
      ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env', validate: validateEnvironment }),
      MongooseModule.forRootAsync({
         inject: [ConfigService],
         useFactory: (config: ConfigService<Environment, true>) => ({ uri: config.get('MONGODB_URI', { infer: true }) }),
      }),
   ],
   controllers: [HealthController],
})
export class AppModule {}
