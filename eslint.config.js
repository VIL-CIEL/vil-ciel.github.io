// Flat config ESLint (v9+) for the portfolio's vanilla browser scripts.
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['public/assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // Lucide is loaded globally via CDN.
        lucide: 'readonly',
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
