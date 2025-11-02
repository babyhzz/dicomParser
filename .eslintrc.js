module.exports = {
  'parser': 'babel-eslint',
  'env': {
    'browser': true,
    'es6': true,
    'jquery': true,
    'node': true,
    'mocha': true
  },
  'extends': 'eslint:recommended',
  'plugins': ['import'],
  'parserOptions': {
    'sourceType': 'module'
  },
  'globals': {
    'dicomParser': true,
    'jpeg': true,
    'JpegImage': true,
    'OpenJPEG': true,
    'JpxImage': true,
    'CharLS': true,
    'pako': true
  },
  'rules': {
    'no-constant-condition': 'off',
    'no-prototype-builtins': 'off',
    "keyword-spacing": "off",
    'space-in-parens': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
  }
};
