/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'use',
          'forward',
          'mixin',
          'include',
          'each',
          'if',
          'else',
          'for',
          'while',
          'function',
          'return',
          'extend',
          'debug',
          'warn',
          'error',
        ],
      },
    ],
    // Allow BEM or other naming conventions without strict regex
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    // Modern SCSS imports don't need extension
    'scss/load-partial-extension': 'never',
  },
};
