import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';
import type { Environment } from './config/environment.js';

const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
// Sends all logs through pino, including Nest's own.
app.useLogger(app.get(PinoLogger));
setupApp(app);

const port = app.get<ConfigService<Environment, true>>(ConfigService).get('PORT', { infer: true });
await app.listen(port);
new Logger('Bootstrap').log(`API listening on port ${port}`);
