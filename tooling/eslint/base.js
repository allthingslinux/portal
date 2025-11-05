import { defineConfig } from '@eslint/config-helpers';
import eslint from '@eslint/js';
import turbo from 'eslint-config-turbo';

import { nextEslintConfig, rules as nextjsEslintRules } from './nextjs.js';

export default defineConfig(
  eslint.configs.recommended,
  ...nextEslintConfig,
  {
    plugins: {
      turbo,
    },
    settings: {
      react: {
        version: '19.2',
      },
    },
    languageOptions: {
      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
  },
  {
    rules: {
      ...nextjsEslintRules,
      'no-undef': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      'react/react-in-jsx-scope': 'off',
      'import/no-anonymous-default-export': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-unresolved': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',
      'import/no-cycle': 'off',
      'import/no-unused-modules': 'off',
      'import/no-deprecated': 'off',
      'turbo/no-undeclared-env-vars': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-i18next',
              importNames: ['Trans'],
              message: 'Please use `@portal/ui/trans` instead',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      '**/node_modules',
      '**/database.types.ts',
      '**/.next',
      '**/public',
      'dist',
      'pnpm-lock.yaml',
    ],
  },
);
