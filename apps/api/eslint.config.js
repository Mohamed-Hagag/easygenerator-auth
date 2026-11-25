import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
   globalIgnores(['dist', 'coverage']),
   {
      files: ['**/*.ts'],
      extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
      languageOptions: {
         globals: globals.node,
         parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
      },
   },
   // Must stay last: turns off ESLint rules that conflict with Prettier formatting.
   prettier,
]);
