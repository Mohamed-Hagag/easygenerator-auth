import { randomUUID } from 'node:crypto';

import type { ConfigService } from '@nestjs/config';
import type { Params } from 'nestjs-pino';

import type { Environment } from '../config/environment.js';

const HEALTH_PATH = '/api/health';

type LoggedRequest = { id: string; method: string; url: string };
type LoggedResponse = { statusCode: number };

const levelFor = (path: string | undefined, statusCode: number): 'error' | 'warn' | 'info' | 'silent' => {
   if (statusCode >= 500) return 'error';
   if (statusCode >= 400) return 'warn';
   // Monitoring calls this constantly, so only its failures are worth a line.
   return path === HEALTH_PATH ? 'silent' : 'info';
};

/** One line per request. Only the listed fields are logged: never headers, cookies, query strings, bodies or IP addresses. */
export const createLoggerParams = (config: ConfigService<Environment, true>): Params => ({
   pinoHttp: {
      level: config.get('LOG_LEVEL', { infer: true }),
      formatters: { level: (label) => ({ level: label }) },
      // JSON everywhere except on a developer's machine.
      transport: config.get('NODE_ENV', { infer: true }) === 'development' ? { target: 'pino-pretty', options: { singleLine: true } } : undefined,
      // Always generated here, so clients cannot write their own values into the logs.
      genReqId: (_request, response) => {
         const id = randomUUID();
         response.setHeader('X-Request-Id', id);
         return id;
      },
      customLogLevel: (request, response) => levelFor((request as { originalUrl?: string }).originalUrl, response.statusCode),
      // The exception filter logs the real error; this would only add a generic one.
      customErrorObject: (_request, _response, _error, values: Record<string, unknown>) => ({ ...values, err: undefined }),
      serializers: {
         req: ({ id, method, url }: LoggedRequest) => ({ id, method, url: url.split('?')[0] }),
         res: ({ statusCode }: LoggedResponse) => ({ statusCode }),
      },
   },
});
