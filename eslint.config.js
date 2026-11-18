// Flat config ESLint (v9+) for the portfolio's vanilla browser scripts.
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['public/assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      // Classic scripts loaded with `defer` (works over file:// too),
      // sharing a single global namespace.
      sourceType: 'script',
      globals: {
        ...globals.browser,
        FV: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: 'error',
      'prefer-const': 'error',
    },
  },
];
