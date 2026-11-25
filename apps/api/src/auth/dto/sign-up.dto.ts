import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength, ValidateBy } from 'class-validator';

import { normalizeEmail, trim } from './transforms.js';

/**
 * Like class-validator's Matches, but with its own name per rule. Errors are keyed by rule name, so several Matches on one
 * property would overwrite each other and only one message would be reported.
 */
const MatchesRule = (ruleName: string, pattern: RegExp, message: string): PropertyDecorator =>
   ValidateBy({ name: ruleName, validator: { validate: (value: unknown) => typeof value === 'string' && pattern.test(value) } }, { message });

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
   @MatchesRule('containsSpecial', /[^\p{L}\p{M}\p{N}\s]/u, 'Password must contain at least one special character')
   @MatchesRule('containsNumber', /\p{N}/u, 'Password must contain at least one number')
   @MatchesRule('containsLetter', /\p{L}/u, 'Password must contain at least one letter')
   @MaxLength(128, { message: 'Password must be at most 128 characters' })
   @MinLength(8, { message: 'Password must be at least 8 characters' })
   @IsString({ message: 'Password is required' })
   password: string;
}
