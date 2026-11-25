import { Transform, Type, plainToInstance } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsString, IsUrl, Matches, Max, Min, MinLength, validateSync } from 'class-validator';

const NODE_ENVS = ['development', 'test', 'production'] as const;
const PLACEHOLDER_SECRET_PREFIX = 'development-only';

export class Environment {
   @IsIn(NODE_ENVS)
   NODE_ENV: (typeof NODE_ENVS)[number];

   @Type(() => Number)
   @IsInt()
   @Min(1)
   @Max(65535)
   PORT: number = 3000;

   @Matches(/^mongodb(\+srv)?:\/\//, { message: 'MONGODB_URI must start with mongodb:// or mongodb+srv://' })
   MONGODB_URI: string;

   @IsString()
   @MinLength(32)
   JWT_ACCESS_SECRET: string;

   @Type(() => Number)
   @IsInt()
   @Min(1)
   ACCESS_TOKEN_TTL_SECONDS: number = 900;

   @Type(() => Number)
   @IsInt()
   @Min(1)
   REFRESH_TOKEN_TTL_DAYS: number = 7;

   @IsUrl({ require_tld: false, require_protocol: true, protocols: ['http', 'https'] })
   WEB_ORIGIN: string;

   @Type(() => Number)
   @IsInt()
   @Min(0)
   TRUST_PROXY_HOPS: number = 0;

   // Off unless explicitly enabled, so production does not expose the docs by accident.
   @Transform(({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value))
   @IsBoolean()
   SWAGGER_ENABLED: boolean = false;
}

/** Stops the application at startup when a setting is missing or invalid. Values are never included in the message. */
export const validateEnvironment = (raw: Record<string, unknown>): Environment => {
   const environment = plainToInstance(Environment, raw);
   const problems = validateSync(environment).flatMap((error) => Object.values(error.constraints ?? {}));

   if (environment.NODE_ENV === 'production' && environment.JWT_ACCESS_SECRET?.startsWith(PLACEHOLDER_SECRET_PREFIX)) {
      problems.push('JWT_ACCESS_SECRET must not be the example value in production');
   }

   if (problems.length > 0) {
      throw new Error(`Invalid environment:\n- ${problems.join('\n- ')}`);
   }
   return environment;
};
