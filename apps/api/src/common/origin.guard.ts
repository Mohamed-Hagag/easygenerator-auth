import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import type { Environment } from '../config/environment.js';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Second layer against cross-site request forgery, next to SameSite cookies. Browsers always send Origin on cross-site writes,
 * so requests without it come from other clients (e.g. curl) that do not hold a user's cookies.
 */
@Injectable()
export class OriginGuard implements CanActivate {
   private readonly allowedOrigin: string;

   constructor(config: ConfigService<Environment, true>) {
      this.allowedOrigin = new URL(config.get('WEB_ORIGIN', { infer: true })).origin;
   }

   canActivate(context: ExecutionContext): boolean {
      const { method, headers } = context.switchToHttp().getRequest<Request>();
      if (SAFE_METHODS.includes(method) || headers.origin === undefined || headers.origin === this.allowedOrigin) {
         return true;
      }
      throw new ForbiddenException('Origin not allowed');
   }
}
