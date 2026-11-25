import { type CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Opts an endpoint out of authentication. Everything else is protected by AccessTokenGuard. */
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
