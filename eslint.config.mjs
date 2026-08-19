// Flat config (ESLint 9's default). eslint-config-next 15 still ships legacy .eslintrc-style
// configs, so they are bridged through FlatCompat — the migration path Next documents for 15.
// This replaces `next lint`, which is deprecated, and which without a config file prompts
// interactively and hangs any non-interactive caller (a hook, or CI).
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const eslintConfig = [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**', 'next-env.d.ts'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
