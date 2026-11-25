import { z } from 'zod';

// These rules mirror the API's DTOs (apps/api/src/auth/dto). The API has the final say; its field errors are shown too.

/** Counts characters like the API does: an emoji is one character, not two. */
const lengthOf = (value: string): number => [...value].length;

/** Letters and numbers of any language count. \p{M} covers accents and other marks that belong to a letter. */
export const PASSWORD_RULES = [
   { label: 'At least 8 characters', error: 'Password must be at least 8 characters', test: (value: string) => lengthOf(value) >= 8 },
   { label: 'At least one letter', error: 'Password must contain at least one letter', test: (value: string) => /\p{L}/u.test(value) },
   { label: 'At least one number', error: 'Password must contain at least one number', test: (value: string) => /\p{N}/u.test(value) },
   {
      label: 'At least one special character',
      error: 'Password must contain at least one special character',
      test: (value: string) => /[^\p{L}\p{M}\p{N}\s]/u.test(value),
   },
];

const newPassword = z
   .string()
   .refine((value) => lengthOf(value) <= 128, 'Password must be at most 128 characters')
   .superRefine((value, context) => {
      for (const { error, test } of PASSWORD_RULES) {
         if (!test(value)) {
            context.addIssue({ code: 'custom', message: error });
         }
      }
   });

export const signUpSchema = z.object({
   email: z.string().trim().toLowerCase().max(254, 'Email must be at most 254 characters').pipe(z.email('Enter a valid email address')),
   name: z
      .string()
      .trim()
      .refine((value) => lengthOf(value) >= 3, 'Name must be at least 3 characters')
      .refine((value) => lengthOf(value) <= 100, 'Name must be at most 100 characters'),
   password: newPassword,
});

/** Sign-in only checks that the fields are filled in; the API decides whether they are correct. */
export const signInSchema = z.object({
   email: z.string().trim().toLowerCase().min(1, 'Email is required').max(254, 'Email must be at most 254 characters'),
   password: z
      .string()
      .min(1, 'Password is required')
      .refine((value) => lengthOf(value) <= 128, 'Password must be at most 128 characters'),
});

export type SignUpValues = z.infer<typeof signUpSchema>;
export type SignInValues = z.infer<typeof signInSchema>;
