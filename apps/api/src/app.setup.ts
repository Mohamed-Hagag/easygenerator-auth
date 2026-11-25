import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AllExceptionsFilter } from './common/all-exceptions.filter.js';
import { createValidationException } from './common/validation-exception.js';
import type { Environment } from './config/environment.js';

export const setupApp = (app: NestExpressApplication): void => {
   const config = app.get<ConfigService<Environment, true>>(ConfigService);

   app.set('trust proxy', config.get('TRUST_PROXY_HOPS', { infer: true }));
   app.setGlobalPrefix('api');
   app.use(helmet());
   app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, exceptionFactory: createValidationException }),
   );
   app.useGlobalFilters(new AllExceptionsFilter());
   app.enableShutdownHooks();

   if (config.get('SWAGGER_ENABLED', { infer: true })) {
      const options = new DocumentBuilder().setTitle('Auth API').setDescription('Sign up, sign in and session endpoints.').setVersion('1.0').build();
      SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, options));
   }
};
