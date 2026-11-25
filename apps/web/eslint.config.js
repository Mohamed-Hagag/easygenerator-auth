import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
   globalIgnores(['dist']),
   {
      files: ['**/*.{ts,tsx}'],
      extends: [
         js.configs.recommended,
         tseslint.configs.recommended,
         reactHooks.configs.flat.recommended,
         reactRefresh.configs.vite,
         jsxA11y.configs.recommended,
      ],
      languageOptions: {
         globals: globals.browser,
         // Set explicitly: editors lint both apps in one process and cannot guess which one this is.
         parserOptions: { tsconfigRootDir: import.meta.dirname },
      },
   },
   // Must stay last: turns off ESLint rules that conflict with Prettier formatting.
   prettier,
]);
