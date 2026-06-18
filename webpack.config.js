const path = require('path');

const extensionConfig = {
  mode: 'none', // Leave minification to vscode:prepublish
  target: 'node', // Extensions run in a node context
  entry: {
    extension: './src/extension.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                module: 'es6', // allow ts-loader to process import/exports
              }
            }
          },
        ],
      },
    ],
  },
  externals: {
    vscode: 'commonjs vscode', // ignored because it doesn't exist
  },
  devtool: 'nosources-source-map',
};

const webviewConfig = {
  mode: 'none', // Leave minification to vscode:prepublish
  target: 'web', // Webviews run in a web context
  entry: {
    webview: './src/webview/index.tsx',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                module: 'es6', // allow ts-loader to process import/exports
              }
            }
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devtool: 'nosources-source-map',
};

module.exports = [extensionConfig, webviewConfig];
