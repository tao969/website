import { FlatCompat } from '@eslint/eslintrc';
import prettierConfig from 'eslint-config-prettier';
import path from 'path';
import tse from 'typescript-eslint';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

const securityPlugin = (await import('eslint-plugin-security')).default;

export default tse.config(
  ...compat.extends('next/core-web-vitals'),
  ...tse.configs.recommended,
  securityPlugin.configs.recommended,
  prettierConfig,
  {
    rules: {
      // General security best practices
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-alert': 'warn',
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

      // TypeScript specific security rules (without type information)
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  {
    ignores: [
      '.next/',
      'node_modules/',
      'build/',
      'out/',
      'public/assets/',
      '.pnpm-store/',
      'next-env.d.ts',
      '.agents/',
    ],
  },
);
