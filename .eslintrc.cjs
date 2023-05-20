const OFF = 0
const WARNING = 1
const ERROR = 2

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['tsconfig.json'],
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  plugins: ['eslint-plugin', '@typescript-eslint'],
  rules: {
    indent: [ERROR, 2],
    semi: [ERROR, 'never'],
    quotes: [ERROR, 'single'],
    'comma-dangle': [ERROR, 'never'],
    'no-multiple-empty-lines': [
      ERROR,
      {
        max: 1,
        maxEOF: 0,
        maxBOF: 0,
      },
    ],
    'array-element-newline': [
      ERROR,
      {
        multiline: true,
        minItems: 3,
      },
    ],
    'array-bracket-newline': [
      ERROR,
      {
        multiline: true,
        minItems: 3,
      },
    ],
    'no-multi-spaces': ERROR,
    'no-trailing-spaces': ERROR,
    'no-unused-vars': 'off',
    'object-curly-spacing': [ERROR, 'always'],
    'comma-spacing': [
      ERROR,
      {
        before: false,
        after: true,
      },
    ],
    // ts
    // "@typescript-eslint/no-unused-vars": [ERROR],
    // "@typescript-eslint/no-non-null-assertion": OFF,
    '@typescript-eslint/space-infix-ops': [
      ERROR,
      {
        int32Hint: false,
      },
    ],
    '@typescript-eslint/member-delimiter-style': [
      ERROR,
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
        multilineDetection: 'brackets',
      },
    ],
    '@typescript-eslint/space-before-blocks': ERROR,
    '@typescript-eslint/type-annotation-spacing': [
      ERROR,
      {
        before: false,
        after: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': WARNING,
  },
}
