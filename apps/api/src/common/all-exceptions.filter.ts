import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';

import type { FieldErrors } from './validation-exception.js';

type ErrorBody = {
   statusCode: number;
   message: string;
   errors?: FieldErrors;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const toErrorBody = (exception: unknown): ErrorBody => {
   if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();
      const errors = isRecord(response) && isRecord(response.errors) ? (response.errors as FieldErrors) : undefined;
      return { statusCode, message: exception.message, ...(errors && { errors }) };
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
