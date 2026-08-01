import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import pluginPromise from 'eslint-plugin-promise';

export default tseslint.config(
  {
    // words.ts is generated. dist/ and coverage/ are build output — they must
    // stay ignored, or the type-aware rules below crash on files that are not
    // in any tsconfig project.
    ignores: ['src/puzzle/words.ts', 'dist/**', 'coverage/**'],
  },

  // The app: full type-aware linting.
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      pluginPromise.configs['flat/recommended'],
      reactHooksPlugin.configs.flat['recommended-latest'],
      reactRefreshPlugin.configs.vite,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/await-thenable': 'error',
      // New in eslint-plugin-react-hooks 7. It flags the mount effect in
      // App.tsx that seeds four states from localStorage. Fixing it means
      // moving to lazy useState initializers, which changes when the persist
      // effect first fires — a refactor with its own PR. See TODO.md.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },

  // Build scripts and config files. These are outside tsconfig.json's project,
  // so type-aware rules would crash on them — they get the syntactic rules
  // only. Keeping them linted at all is the point; see TODO.md.
  {
    files: ['scripts/**/*.ts', 'vite.config.ts', 'jest.config.js', 'eslint.config.mjs'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: false,
        projectService: false,
      },
    },
  },
);
