const baseConfig = require('./webpack-base');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const { merge } = require('webpack-merge');

const devConfig = {
  output: {
    filename: '[name].min.js'
  },
  mode: "production",
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true
      })
    ]
  },
};

module.exports = merge(baseConfig, devConfig);