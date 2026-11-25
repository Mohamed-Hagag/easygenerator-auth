import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';

import type { Environment } from '../config/environment.js';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

const readCookie = (request: Request, name: string): string | null => {
   // cookie-parser can also produce objects ("j:{...}" values), which are never valid tokens.
   const value = (request.cookies as Record<string, unknown> | undefined)?.[name];
   return typeof value === 'string' && value !== '' ? value : null;
};

export const readAccessToken = (request: Request): string | null => readCookie(request, ACCESS_COOKIE);

export const readRefreshToken = (request: Request): string | null => readCookie(request, REFRESH_COOKIE);

@Injectable()
export class AuthCookies {
   private readonly accessOptions: CookieOptions;
   private readonly refreshOptions: CookieOptions;
   private readonly accessMaxAgeMs: number;

   constructor(config: ConfigService<Environment, true>) {
      const secure = config.get('NODE_ENV', { infer: true }) === 'production';
      this.accessOptions = { httpOnly: true, sameSite: 'strict', secure, path: '/api' };
      // Only the auth endpoints ever receive the refresh token.
      this.refreshOptions = { ...this.accessOptions, path: '/api/auth' };
      this.accessMaxAgeMs = config.get('ACCESS_TOKEN_TTL_SECONDS', { infer: true }) * 1000;
   }

   set(response: Response, tokens: { accessToken: string; refreshToken: string; refreshExpiresAt: Date }): void {
      response.cookie(ACCESS_COOKIE, tokens.accessToken, { ...this.accessOptions, maxAge: this.accessMaxAgeMs });
      response.cookie(REFRESH_COOKIE, tokens.refreshToken, { ...this.refreshOptions, expires: tokens.refreshExpiresAt });
   }

   clear(response: Response): void {
      response.clearCookie(ACCESS_COOKIE, this.accessOptions);
      response.clearCookie(REFRESH_COOKIE, this.refreshOptions);
   }
}
