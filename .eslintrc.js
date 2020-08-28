/* eslint-disable sort-keys */
module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'airbnb-base',
  ],
  rules: {
    // forbid the `() => ({ bar: 0 })` syntax
    'arrow-body-style': [
      'error',
      'as-needed',
      {requireReturnForObjectLiteral: true},
    ],

    // no arrow function parentheses where they can be omitted
    'arrow-parens': ['error', 'as-needed'],

    // forbid one-liners with braces (e.g. `if (...) { } else { }` or `try { } catch (e) { }`)
    // and enforce curly braces even for one-expression statements (e.g. forbid  `if (...) return;`)
    'brace-style': [
      'error',
      '1tbs',
      {allowSingleLine: false},
    ],
    curly: ['error', 'all'],

    // allow multiple classes per file
    'max-classes-per-file': 'off',

    // allow longer code lines
    'max-len': [
      'error',
      160,
      2,
      {
        ignoreUrls: true,
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: false,
        ignoreTemplateLiterals: false,
      },
    ],

    // forbid chained calls one-liners, e.g. `obj.foo().bar().biz()`
    'newline-per-chained-call': ['error', {ignoreChainWithDepth: 1}],

    // allow bitwise operations
    'no-bitwise': 'off',

    // forbid console usage
    'no-console': 'error',

    // allow continue statement in for-loop
    'no-continue': 'off',

    // allow TypeScript class method overloading
    'lines-between-class-members': [
      'error',
      'always',
      {exceptAfterSingleLine: true},
    ],
    'no-dupe-class-members': 'off',

    // allow function parameter property updates
    'no-param-reassign': ['error', {props: false}],

    // allow for-in and for-of syntax (restricted by default) and forbid with and goto syntax
    'no-restricted-syntax': [
      'error',
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'guard-for-in': 'off',

    // `o = {a: 1}` is fine, but `o = {a: 1, b: 2}` needs to be broken into multiple lines
    // the same holds for import / export declarations
    'object-property-newline': ['error', {
      allowAllPropertiesOnSameLine: true,
      allowMultiplePropertiesPerLine: false,
    }],
    'object-curly-newline': ['error', {
      ObjectExpression: {
        minProperties: 3,
        multiline: true,
        consistent: true,
      },
      ObjectPattern: {
        minProperties: 3,
        multiline: true,
        consistent: true,
      },
      ImportDeclaration: {
        minProperties: 3,
        multiline: true,
        consistent: true,
      },
      ExportDeclaration: {
        minProperties: 3,
        multiline: true,
        consistent: true,
      },
    }],

    // consistent newline after/before function parens
    'function-paren-newline': ['error', 'consistent'],

    // `arr = [1, 2]` is fine, `arr = [1, 2, 3]` must be broken into multiple lines
    'array-element-newline': ['error', {minItems: 3}],

    // no spaces inside curly braces
    'object-curly-spacing': ['error', 'never'],

    // enforce object keys sorting
    'sort-keys': [
      'error',
      'asc',
      {
        caseSensitive: false,
        natural: false,
      },
    ],

    // turn off import checks by node rule, it is checked by import/* rules (that support aliases)
    'node/no-missing-import': 'off',

    // allow import / export syntax in node.js modules
    'node/no-unsupported-features/es-syntax': ['error', {
      version: '>=12.0.0',
      ignores: ['modules'],
    }],

    // no file extensions when importing modules
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
      },
    ],

    // no default export
    'import/no-default-export': 'error',
    'import/prefer-default-export': 'off',

    // forbid the import of external modules that are not declared in the package.json
    // importing is allowed only from modules listed in 'dependencies' and 'devDependecies'
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
      optionalDependencies: false,
      peerDependencies: false,
      bundledDependencies: false,
    }],

    // enforce import statement ordering
    'import/order': ['error', {
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
      groups: [['builtin', 'external'], [
        'internal',
        'parent',
        'sibling',
        'index',
      ]],
    }],
  },
};
