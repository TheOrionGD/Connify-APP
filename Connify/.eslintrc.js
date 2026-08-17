module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['unused-imports'],
  rules: {
    'react-native/no-inline-styles': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': 'off',
    'no-bitwise': 'off',
    '@typescript-eslint/no-shadow': 'off'
  },
  ignorePatterns: ['**/*.js'],
};
