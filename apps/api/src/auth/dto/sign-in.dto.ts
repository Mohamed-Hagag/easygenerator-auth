import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { normalizeEmail } from './transforms.js';

/** Checks only type and size: the sign-up rules must not reveal anything about a stored password. */
export class SignInDto {
   @ApiProperty({ example: 'jane@example.com', maxLength: 254 })
   @Transform(normalizeEmail)
   @MaxLength(254, { message: 'Email must be at most 254 characters' })
   @IsNotEmpty({ message: 'Email is required' })
   @IsString({ message: 'Email is required' })
   email: string;

   @ApiProperty({ example: 'correct-horse-1', maxLength: 128 })
   @MaxLength(128, { message: 'Password must be at most 128 characters' })
   @IsNotEmpty({ message: 'Password is required' })
   @IsString({ message: 'Password is required' })
   password: string;
}
