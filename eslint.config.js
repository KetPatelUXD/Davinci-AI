import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['**/figma/code-connect/**', '**/dist/**', '**/storybook-static/**', 'reference/**', 'assets/**', '**/node_modules/**', '**/*.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'jsx-a11y': jsxA11y, 'react-hooks': reactHooks },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // `role` is a domain prop on some components (ChatMessage role="user" | "assistant"), not an ARIA role.
      'jsx-a11y/aria-role': ['error', { ignoreNonDOM: true }],
      // Scrollable regions, charts and separators must be keyboard focusable (WCAG 2.1.1 / axe scrollable-region-focusable).
      'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: ['pre', 'div'], roles: ['tabpanel', 'region', 'separator', 'log', 'group'] }],
      'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['**/*.{mjs,js,cjs}', 'scripts/**', '**/scripts/**'],
    languageOptions: { globals: { ...globals.node } },
  },
);
