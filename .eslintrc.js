module.exports = {
  env: {
    browser: true,
    builtin: true,
    es6: true,
    node: true,
    jest: true,
    jasmine: true
  },
  extends: ['eslint:recommended', 'plugin:import/errors'],
  plugins: ['prettier', 'import', 'jasmine', 'promise'],
  rules: {
    'no-return-await': 'error',
    'prettier/prettier': 'error',
    'import/order': 'error',
    'jasmine/no-focused-tests': 'error',
    camelcase: ['error', { properties: 'never' }],
    'no-console': ['error', { allow: ['error', 'info'] }],
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
    'no-use-before-define': ['error', { functions: true, classes: true }],
    'valid-jsdoc': [
      'error',
      {
        requireReturn: false,
        prefer: { return: 'returns' },
        preferType: {
          Boolean: 'Boolean',
          Number: 'Number',
          Object: 'Object',
          String: 'String',
          Array: 'Array',
          Promise: 'Promise'
        },
        requireParamDescription: false,
        requireReturnDescription: false
      }
    ],
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-nesting': 'error',
    'promise/no-promise-in-callback': 'error',
    'promise/no-callback-in-promise': 'error',
    'promise/no-new-statics': 'error',
    'promise/no-return-in-finally': 'error',
    'promise/valid-params': 'error',
    'promise/prefer-await-to-then': 'error',
    'require-atomic-updates': 0
  },
  parserOptions: {
    ecmaVersion: '2018',
    sourceType: 'module'
  },
  settings: {
    'import/resolver': {
      'babel-module': {},
      node: {
        paths: ['src']
      }
    }
  }
};
