import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { Contains } from './contains.decorator.js';
import { normalizeEmail, trim } from './transforms.js';

export class SignUpDto {
   @ApiProperty({ example: 'jane@example.com', maxLength: 254 })
   @Transform(normalizeEmail)
   @MaxLength(254, { message: 'Email must be at most 254 characters' })
   @IsEmail({}, { message: 'Enter a valid email address' })
   email: string;

   @ApiProperty({ example: 'Jane Doe', minLength: 3, maxLength: 100 })
   @Transform(trim)
   @MaxLength(100, { message: 'Name must be at most 100 characters' })
   @MinLength(3, { message: 'Name must be at least 3 characters' })
   @IsString({ message: 'Name is required' })
   name: string;

   // Letters and numbers of any language count. \p{M} covers accents and other marks that belong to a letter.
   @ApiProperty({
      example: 'correct-horse-1',
      minLength: 8,
      maxLength: 128,
      description: 'At least one letter, one number and one special character.',
   })
   @Contains('containsSpecial', /[^\p{L}\p{M}\p{N}\s]/u, 'Password must contain at least one special character')
   @Contains('containsNumber', /\p{N}/u, 'Password must contain at least one number')
   @Contains('containsLetter', /\p{L}/u, 'Password must contain at least one letter')
   @MaxLength(128, { message: 'Password must be at most 128 characters' })
   @MinLength(8, { message: 'Password must be at least 8 characters' })
   @IsString({ message: 'Password is required' })
   password: string;
}
