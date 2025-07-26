const js = require('@eslint/js');
const globals = require('globals');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const tseslint = require('typescript-eslint');
const { globalIgnores } = require('eslint/config');

module.exports = tseslint.config([
  globalIgnores(['dist', 'src/pages/**']),
  {
    files: ['js', 'tsx'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      '@eslint/js': js.configs.recommended,
      '@typescript-eslint': tseslint.configs.recommended,
      'react-hooks': reactHooks.configs['recommended-latest'],
      'react-refresh': reactRefresh.configs.vite
    }
  }
]);