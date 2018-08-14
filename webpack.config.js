const path = require('path');

module.exports = {
  mode: "production",
  entry: './lib/index.browser.ts',
  devtool: 'source-map',
  output: {
    filename: 'azure-storage-blob.js',
    path: path.resolve(__dirname, 'browser'),
    libraryTarget: 'umd',
    library: 'AzureStorageBlob'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /(node_modules|test|samples)/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  node: {
    fs: false,
    net: false,
    path: false,
    dns: false,
    tls: false,
    tty: false,
    v8: false,
    Buffer: false,
  },
  performance: {
    hints: "warning",
    maxAssetSize: 300 * 1024 * 1024,
    maxEntrypointSize: 400 * 1024 * 1024
  },
};
