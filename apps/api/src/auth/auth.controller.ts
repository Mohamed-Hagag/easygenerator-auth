import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import {
   ApiBadRequestResponse,
   ApiConflictResponse,
   ApiCreatedResponse,
   ApiNoContentResponse,
   ApiOkResponse,
   ApiTags,
   ApiTooManyRequestsResponse,
   ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { Public } from '../common/public.decorator.js';
import { SessionCookies, readRefreshToken } from '../sessions/session-cookies.js';
import type { UserDocument } from '../users/user.schema.js';
import { UserResponse, toUserResponse } from '../users/user-response.js';
import { AuthService } from './auth.service.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';

const CREDENTIALS_LIMIT = { default: { limit: 10, ttl: 60_000 } };
const REFRESH_LIMIT = { default: { limit: 30, ttl: 60_000 } };

@ApiTags('auth')
@ApiTooManyRequestsResponse({ description: 'Too many requests.' })
@Public()
@Controller('auth')
export class AuthController {
   constructor(
      private readonly auth: AuthService,
      private readonly cookies: SessionCookies,
   ) {}

   @Post('signup')
   @Throttle(CREDENTIALS_LIMIT)
   @ApiCreatedResponse({ type: UserResponse, description: 'Account created; sets the session cookies.' })
   @ApiBadRequestResponse({ description: 'Invalid fields.' })
   @ApiConflictResponse({ description: 'The email is already registered.' })
   async signUp(@Body() dto: SignUpDto, @Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<UserResponse> {
      return this.startSession(await this.auth.signUp(dto), request, response);
   }

   @Post('signin')
   @HttpCode(HttpStatus.OK)
   @Throttle(CREDENTIALS_LIMIT)
   @ApiOkResponse({ type: UserResponse, description: 'Signed in; sets the session cookies.' })
   @ApiBadRequestResponse({ description: 'Invalid fields.' })
   @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
   async signIn(@Body() dto: SignInDto, @Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<UserResponse> {
      return this.startSession(await this.auth.signIn(dto), request, response);
   }

   @Post('refresh')
   @HttpCode(HttpStatus.NO_CONTENT)
   @Throttle(REFRESH_LIMIT)
   @ApiNoContentResponse({ description: 'Session continued; replaces both cookies.' })
   @ApiUnauthorizedResponse({ description: 'The refresh cookie is missing, expired or already used.' })
   async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
      const tokens = await this.auth.refreshSession(readRefreshToken(request));
      if (!tokens) {
         this.cookies.clear(response);
         throw new UnauthorizedException('Session expired');
      }
      this.cookies.set(response, tokens);
   }

   @Post('logout')
   @HttpCode(HttpStatus.NO_CONTENT)
   @ApiNoContentResponse({ description: 'Session revoked and cookies cleared. Safe to repeat.' })
   async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
      await this.auth.endSession(readRefreshToken(request));
      this.cookies.clear(response);
   }

   private async startSession(user: UserDocument, request: Request, response: Response): Promise<UserResponse> {
      this.cookies.set(response, await this.auth.startSession(user.id, readRefreshToken(request)));
      return toUserResponse(user);
   }
}
