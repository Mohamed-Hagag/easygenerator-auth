import { ConflictException, Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, type UserDocument } from './user.schema.js';

const DUPLICATE_KEY_CODE = 11000;

const isDuplicateKeyError = (error: unknown): boolean => error instanceof Error && 'code' in error && error.code === DUPLICATE_KEY_CODE;

@Injectable()
export class UsersService implements OnModuleInit {
   constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

   /** Waits for the unique email index, so no sign-up is accepted before it exists. */
   async onModuleInit(): Promise<void> {
      await this.userModel.init();
   }

   /** The unique index decides duplicates, so simultaneous sign-ups cannot create the same email twice. */
   async create(user: User): Promise<UserDocument> {
      try {
         return await this.userModel.create(user);
      } catch (error) {
         if (isDuplicateKeyError(error)) {
            const message = 'An account with this email already exists';
            throw new ConflictException({ message, errors: { email: [message] } });
         }
         throw error;
      }
   }

   findByEmailWithPassword(email: string): Promise<UserDocument | null> {
      return this.userModel.findOne({ email }).select('+passwordHash').exec();
   }
}
