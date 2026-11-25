import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { UserResponse, toUserResponse } from './dto/user-response.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
   constructor(private readonly auth: AuthService) {}

   @Post('signup')
   @ApiCreatedResponse({ type: UserResponse })
   @ApiBadRequestResponse({ description: 'Invalid fields.' })
   @ApiConflictResponse({ description: 'The email is already registered.' })
   async signUp(@Body() dto: SignUpDto): Promise<UserResponse> {
      return toUserResponse(await this.auth.signUp(dto));
   }

   @Post('signin')
   @HttpCode(HttpStatus.OK)
   @ApiOkResponse({ type: UserResponse })
   @ApiBadRequestResponse({ description: 'Invalid fields.' })
   @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
   async signIn(@Body() dto: SignInDto): Promise<UserResponse> {
      return toUserResponse(await this.auth.signIn(dto));
   }
}
