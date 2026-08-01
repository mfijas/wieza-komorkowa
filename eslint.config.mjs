import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import pluginPromise from 'eslint-plugin-promise'

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: ['eslint.config.mjs', 'src/puzzle/words.ts', 'scripts/**/*.*', 'vite.config.ts', 'jest.config.js', 'dist/**/*.*', 'coverage/**/*.*']
  },
  reactHooksPlugin.configs.flat['recommended-latest'],
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
      // New in eslint-plugin-react-hooks 7. It flags the mount effect in
      // App.tsx that seeds four states from localStorage. Fixing it means
      // moving to lazy useState initializers, which changes when the persist
      // effect first fires — a refactor with its own PR. See TODO.md.
      'react-hooks/set-state-in-effect': 'warn',
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
