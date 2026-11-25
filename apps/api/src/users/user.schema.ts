import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
   // Stored trimmed and lowercased (see the DTOs), so the unique index is effectively case-insensitive.
   @Prop({ type: String, required: true, unique: true })
   email: string;

   @Prop({ type: String, required: true })
   name: string;

   // Excluded from queries unless explicitly selected.
   @Prop({ type: String, required: true, select: false })
   passwordHash: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
