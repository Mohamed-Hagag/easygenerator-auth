import { randomUUID } from 'node:crypto';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, type Types } from 'mongoose';

/** One signed-in browser. Deleting the document revokes the session. */
@Schema({ timestamps: true })
export class Session {
   @Prop({ type: String, default: randomUUID })
   _id: string;

   @Prop({ type: SchemaTypes.ObjectId, required: true })
   userId: Types.ObjectId;

   // SHA-256 of the only refresh token that is currently valid for this session.
   @Prop({ type: String, required: true })
   tokenHash: string;

   // Fixed at sign-in; refreshing does not extend it.
   @Prop({ type: Date, required: true })
   expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// MongoDB deletes sessions after they expire.
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
