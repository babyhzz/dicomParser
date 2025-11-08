const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");

/**
 * 通用基础配置
 */
const baseConfig = {
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  plugins: [new ESLintPlugin()],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};

/**
 * UMD 构建
 */
const umdConfig = {
  ...baseConfig,
  mode: "production",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "dicomParser.min.js",
    library: {
      name: "dicomParser",
      type: "umd",
    },
    globalObject: "this",
    clean: true,
  },
  target: ["web", "es5"],
};

/**
 * ESM 构建
 */
const esmConfig = {
  ...baseConfig,
  mode: "production",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "dicomParser.esm.js",
    library: {
      type: "module",
    },
    clean: false,
  },
  experiments: {
    outputModule: true,
  },
  target: ["web", "es2020"],
};

module.exports = [umdConfig, esmConfig];
