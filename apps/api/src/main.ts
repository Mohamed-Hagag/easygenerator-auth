import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';
import type { Environment } from './config/environment.js';

const app = await NestFactory.create<NestExpressApplication>(AppModule);
setupApp(app);

const port = app.get<ConfigService<Environment, true>>(ConfigService).get('PORT', { infer: true });
await app.listen(port);
new Logger('Bootstrap').log(`API listening on port ${port}`);
