import js from '@eslint/js';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

/**
 * Flat config (eslint 9+). There was previously NO config file at all, and the
 * `lint` script passed `--ext`, which eslint 10 removed — so `npm run lint` was
 * broken rather than merely unhelpful. Neither state surfaced a single finding.
 */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/.svelte-kit/**',
      '**/coverage/**',
      '**/packages/*/dist/**',
      // Compiled output (already gitignored).
      'packages/*/lib/**',
      '**/*.map',
      // Component registry copied verbatim into scaffolded projects. It is
      // template payload, not this repo's source — lint it where it lands.
      'packages/create-frontend/src/registry/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Scope every svelte config entry to svelte files. Some entries in
  // flat/recommended carry no `files` key and would otherwise apply globally —
  // its core-rule replacements then crash on CommonJS (`svelte/no-inner-declarations`
  // throws reading 'isStrict' on a .cjs script).
  ...svelte.configs['flat/recommended'].map((c) =>
    c.files ? c : { ...c, files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'] },
  ),
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, NodeJS: 'readonly' },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',

      // Remaining pre-existing findings, same baseline rationale. Checked by
      // hand, none are defects: the `no-useless-assignment` hits are switch
      // initialisers whose every reaching path reassigns (`default: return`),
      // and the `no-control-regex` hits are deliberate control-character
      // sanitisers in security.ts.
      'no-useless-assignment': 'warn',
      'no-control-regex': 'warn',
      'no-useless-catch': 'warn',
      'no-constant-binary-expression': 'warn',
      'no-useless-escape': 'warn',
      'no-case-declarations': 'warn',
      'prefer-spread': 'warn',
      'prefer-const': 'warn',
      'preserve-caught-error': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/prefer-as-const': 'warn',
      // Bare `Function` in the event-bus / pub-sub callback registries.
      // Worth tightening to real call signatures, but that ripples through
      // duplicated copies in core and utils-event-bus — a deliberate change,
      // not a drive-by one.
      '@typescript-eslint/no-unsafe-function-type': 'warn',

      // BASELINE, NOT AN ENDORSEMENT.
      //
      // Enabling lint here surfaced ~1,100 pre-existing errors in a codebase
      // that had never been linted (there was no config file at all). The rules
      // below are downgraded to warnings so `npm run lint` reports real findings
      // and still exits 0, rather than being permanently red — which would
      // signal exactly as little as the broken script it replaced.
      //
      // These are a burn-down list, not settled style. Counts at the time of
      // writing, to make progress measurable:
      //   no-unused-vars               ~425  mechanical, but must NOT be
      //                                      bulk-automated: prefixing an
      //                                      unused import specifier silently
      //                                      breaks the import.
      //   svelte/require-each-key      ~424  correctness-adjacent; keyed {#each}
      //                                      avoids re-render identity bugs.
      //   svelte/no-navigation-without-resolve ~87
      //   svelte/no-at-html-tags        ~77  SECURITY-RELEVANT: {@html} is an
      //                                      XSS surface. Audit these before
      //                                      anything renders user-supplied
      //                                      content; do not let the warning
      //                                      status imply they are benign.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser, svelteConfig },
    },
    plugins: { svelte },
    // Part of the baseline described above — see that comment for counts and
    // why these are warnings rather than settled style.
    rules: {
      'svelte/require-each-key': 'warn',
      'svelte/no-navigation-without-resolve': 'warn',
      'svelte/no-at-html-tags': 'warn',
      'svelte/prefer-svelte-reactivity': 'warn',
      'svelte/no-useless-mustaches': 'warn',
      'svelte/prefer-writable-derived': 'warn',
      'svelte/no-unused-svelte-ignore': 'warn',
    },
  },
  {
    // Node tooling scripts are CommonJS by design.
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // These scripts shadow browser globals (`prompt`) harmlessly.
      'no-redeclare': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/__tests__/**/*.ts', '**/*.config.*'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
];
