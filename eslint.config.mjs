import js from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'scripts/**'],
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
      'prettier/prettier': 'error', // Enforce Prettier formatting as ESLint errors

      // **Stricter Linting Rules**
      'indent': ['error', 2], // Enforce 2-space indentation
      'quotes': ['error', 'single', { avoidEscape: true }], // Single quotes
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Disallow unused vars
      '@typescript-eslint/explicit-function-return-type': 'error', // Require explicit return types
      '@typescript-eslint/no-explicit-any': 'error', // Disallow `any` type
      'object-curly-spacing': ['error', 'always'], // Enforce spaces inside braces
      'no-console': 'warn', // Warn for console logs
    },
  },
  // Jest-specific configuration for test files
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
        jest: true, // Enable Jest globals like `describe`, `test`, etc.
      },
    },
    env: {
      jest: true, // Set Jest as the environment for test files
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Allow `any` type in tests
      'no-console': 'off', // Allow console logs in tests
    },
  },
];