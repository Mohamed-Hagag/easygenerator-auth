import { Controller, Get, Header, UnauthorizedException } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { CurrentUserId } from '../auth/current-user.decorator.js';
import { UserResponse, toUserResponse } from './user-response.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiCookieAuth()
@Controller('users')
export class UsersController {
   constructor(private readonly users: UsersService) {}

   @Get('me')
   @Header('Cache-Control', 'no-store')
   @ApiOkResponse({ type: UserResponse, description: 'The signed-in user.' })
   @ApiUnauthorizedResponse({ description: 'Not signed in.' })
   async me(@CurrentUserId() userId: string): Promise<UserResponse> {
      const user = await this.users.findById(userId);
      if (!user) {
         throw new UnauthorizedException('Authentication required');
      }
      return toUserResponse(user);
   }
}
