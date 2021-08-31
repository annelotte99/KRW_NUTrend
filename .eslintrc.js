module.exports = {
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  globals: {
    chrome: true,
    Vue: 'readable',
  },
  plugins: [ 'vue' ], // required to lint *.vue files
  extends: [
    'plugin:vue/essential',
    'plugin:vue/strongly-recommended',
    'plugin:vue/recommended',
  ],
  rules: {
    'comma-dangle': [ 'error', 'always-multiline' ],
    'semi': ['error', 'never'],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'warn',
    'vue/max-attributes-per-line': [ 'error', { singleline: 2 } ],
    'vue/no-unused-components': 'warn',
    'vue/script-indent': [ 'error', 2, { baseIndent: 1 } ],
    'vue/no-v-html': 'off',
  },
}
