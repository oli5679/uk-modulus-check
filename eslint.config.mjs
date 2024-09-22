// eslint.config.mjs
import js from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescriptPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error', // Runs Prettier as an ESLint rule

      // **Stricter Linting Rules**
      // Enforce consistent indentation
      'indent': ['error', 2],
      // Enforce the use of single quotes
      'quotes': ['error', 'single', { avoidEscape: true }],
      // Disallow unused variables
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Enforce explicit return types on functions and class methods
      '@typescript-eslint/explicit-function-return-type': 'error',
      // Disallow usage of the `any` type
      '@typescript-eslint/no-explicit-any': 'error',
      // Enforce consistent spacing inside braces
      'object-curly-spacing': ['error', 'always'],
      // Disallow console logs (useful for production code)
      'no-console': 'warn',
      // Additional rules can be added here
    },
  },
];