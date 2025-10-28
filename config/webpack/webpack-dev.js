const webpack = require('webpack');
const baseConfig = require('./webpack-base');
const { merge } = require('webpack-merge');

const devConfig = {
  devServer: {
    hot: true,
    static: {
      publicPath: '/dist/'
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin({})
  ]
};

module.exports = merge(baseConfig, devConfig);
