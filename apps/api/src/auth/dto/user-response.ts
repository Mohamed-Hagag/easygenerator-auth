import { ApiProperty } from '@nestjs/swagger';

import type { UserDocument } from '../../users/user.schema.js';

export class UserResponse {
   @ApiProperty({ example: '665f1c2e8b3e4a0012345678' })
   id: string;

   @ApiProperty({ example: 'jane@example.com' })
   email: string;

   @ApiProperty({ example: 'Jane Doe' })
   name: string;
}

/** Copies only the public fields, so the password hash can never end up in a response. */
export const toUserResponse = (user: UserDocument): UserResponse => ({ id: user.id, email: user.email, name: user.name });
