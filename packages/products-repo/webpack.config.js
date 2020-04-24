const path = require('path')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/index.js',
  target: 'async-node',
  devtool: 'source-map',
  output: {
    libraryTarget: 'commonjs2',
    path: path.resolve('./public')
  },
  optimization: {
    minimize: false
  },
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.mjs', '.js', '.json'],
    alias: {
      encoding: false
    }
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'gql_products',
      library: { type: 'commonjs2' },
      filename: 'remoteEntry.js',
      exposes: {
        schema: './src/schema.js'
      },
      shared: [
        '@apollo/federation',
        'apollo-server',
        'apollo-server-micro'
      ]
    })
  ]
}
