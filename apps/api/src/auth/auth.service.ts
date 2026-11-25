import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { UserDocument } from '../users/user.schema.js';
import { UsersService } from '../users/users.service.js';
import type { SignInDto } from './dto/sign-in.dto.js';
import type { SignUpDto } from './dto/sign-up.dto.js';
import { PasswordService } from './password.service.js';

@Injectable()
export class AuthService {
   constructor(
      private readonly users: UsersService,
      private readonly passwords: PasswordService,
   ) {}

   async signUp({ email, name, password }: SignUpDto): Promise<UserDocument> {
      const passwordHash = await this.passwords.hash(password);
      return this.users.create({ email, name, passwordHash });
   }

   async signIn({ email, password }: SignInDto): Promise<UserDocument> {
      const user = await this.users.findByEmailWithPassword(email);
      const matches = await this.passwords.verify(user?.passwordHash, password);

      if (!user || !matches) {
         throw new UnauthorizedException('Invalid email or password');
      }
      return user;
   }
}
