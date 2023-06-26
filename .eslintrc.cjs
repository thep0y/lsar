const OFF = 0
// const WARNING = 1
// const ERROR = 2

module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['tsconfig.eslint.json'],
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  plugins: ['eslint-plugin', '@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/no-non-null-assertion': OFF,
  },
}
