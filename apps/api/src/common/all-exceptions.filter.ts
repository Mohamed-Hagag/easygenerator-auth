import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';

import type { FieldErrors } from './validation-exception.js';

type ErrorBody = {
   statusCode: number;
   message: string;
   errors?: FieldErrors;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/** Express middleware (e.g. the body parser) throws plain errors that carry a 4xx status. */
const clientErrorStatus = (exception: unknown): number | null => {
   if (!isRecord(exception) || typeof exception.status !== 'number') {
      return null;
   }
   return exception.status >= 400 && exception.status < 500 ? exception.status : null;
};

const toErrorBody = (exception: unknown): ErrorBody => {
   if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();
      const errors = isRecord(response) && isRecord(response.errors) ? (response.errors as FieldErrors) : undefined;
      return { statusCode, message: exception.message, ...(errors && { errors }) };
   }

   const statusCode = clientErrorStatus(exception);
   if (statusCode !== null) {
      return { statusCode, message: 'Invalid request' };
   }

   return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
};

/** Gives every error the same JSON shape and keeps internal details out of responses. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
   private readonly logger = new Logger(AllExceptionsFilter.name);

   catch(exception: unknown, host: ArgumentsHost): void {
      const body = toErrorBody(exception);

      if (body.statusCode >= 500) {
         this.logger.error(exception instanceof Error ? (exception.stack ?? exception.message) : 'Unknown error');
      }

      const response = host.switchToHttp().getResponse<Response>();
      if (response.headersSent) {
         response.end();
         return;
      }
      response.status(body.statusCode).json(body);
   }
}
