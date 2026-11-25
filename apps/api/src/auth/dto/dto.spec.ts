import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { SignInDto } from './sign-in.dto.js';
import { SignUpDto } from './sign-up.dto.js';

const validSignUp = { email: 'jane@example.com', name: 'Jane', password: 'abcdef1!' };

const messagesFor = (dto: object, field: string): string[] =>
   validateSync(dto)
      .filter((error) => error.property === field)
      .flatMap((error) => Object.values(error.constraints ?? {}));

const signUpErrors = (field: keyof SignUpDto, value: unknown) => messagesFor(plainToInstance(SignUpDto, { ...validSignUp, [field]: value }), field);

describe('SignUpDto', () => {
   it('accepts valid input', () => {
      expect(validateSync(plainToInstance(SignUpDto, validSignUp))).toEqual([]);
   });

   it('normalizes email and name but never the password', () => {
      const dto = plainToInstance(SignUpDto, { email: ' Jane@Example.COM ', name: ' Jane ', password: ' aB1!aB1! ' });
      expect(dto).toEqual({ email: 'jane@example.com', name: 'Jane', password: ' aB1!aB1! ' });
   });

   it.each(['', 'jane', 'jane@', '@example.com', 'jane@example', undefined, { $ne: null }])('rejects email %j', (email) => {
      expect(signUpErrors('email', email)).toContain('Enter a valid email address');
   });

   it.each(['', 'ab', '  ab  '])('rejects short name %j', (name) => {
      expect(signUpErrors('name', name)).toContain('Name must be at least 3 characters');
   });

   it('accepts a 3-character name and rejects one over 100', () => {
      expect(signUpErrors('name', 'abc')).toEqual([]);
      expect(signUpErrors('name', 'a'.repeat(101))).toEqual(['Name must be at most 100 characters']);
   });

   it.each([
      ['abcde1!', 'Password must be at least 8 characters'],
      ['12345678!', 'Password must contain at least one letter'],
      ['abcdefgh!', 'Password must contain at least one number'],
      ['abcdefg1', 'Password must contain at least one special character'],
      ['abcdef 1', 'Password must contain at least one special character'],
      ['a1!'.repeat(43), 'Password must be at most 128 characters'],
   ])('rejects password %j only because: %s', (password, message) => {
      expect(signUpErrors('password', password)).toEqual([message]);
   });

   it('reports every broken password rule at once', () => {
      expect(signUpErrors('password', '   ')).toEqual(
         expect.arrayContaining([
            'Password must be at least 8 characters',
            'Password must contain at least one letter',
            'Password must contain at least one number',
            'Password must contain at least one special character',
         ]),
      );
   });

   it.each(['abcdef1!', 'مرحبابك1!', 'abc def1_', `a1!${'x'.repeat(125)}`])('accepts password %j', (password) => {
      expect(signUpErrors('password', password)).toEqual([]);
   });

   it('does not count an accent mark as a special character', () => {
      expect(signUpErrors('password', 'caféabc1')).toEqual(['Password must contain at least one special character']);
   });

   it.each([undefined, null, 12345678, { $ne: null }])('rejects non-string password %j', (password) => {
      expect(signUpErrors('password', password)).toContain('Password is required');
   });
});

describe('SignInDto', () => {
   it('does not apply the sign-up rules', () => {
      expect(validateSync(plainToInstance(SignInDto, { email: 'x', password: 'y' }))).toEqual([]);
   });

   it.each(['', undefined, { $ne: null }])('rejects email and password %j', (value) => {
      const dto = plainToInstance(SignInDto, { email: value, password: value });
      expect(messagesFor(dto, 'email')).toContain('Email is required');
      expect(messagesFor(dto, 'password')).toContain('Password is required');
   });
});
