import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import pluginPromise from 'eslint-plugin-promise'

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: ['eslint.config.mjs', 'src/puzzle/words.ts', 'scripts/**/*.*', 'vite.config.ts', 'jest.config.js', 'dist/**/*.*']
  },
  ...compat.extends('plugin:react-hooks/recommended'),
  pluginPromise.configs['flat/recommended'],
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      '@typescript-eslint/await-thenable': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  // Add this block to disable type-aware rules for config files:
  {
    files: ['eslint.config.mjs', 'jest.config.js'],
    languageOptions: {
      parserOptions: {
        project: null, // Disable type checking explicitly for these files
      },
    },
    rules: {
      '@typescript-eslint/*': 'off'
    },
  },
];
