const path = require('path')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: ['@babel/polyfill', './src/index.js'],
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
      bufferutil: false,
      encoding: false,
      'utf-8-validate': false
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
      name: 'gql_gateway',
      library: { type: 'commonjs2' },
      filename: 'remoteEntry.js',
      remotes: {
        gql_pdp: 'gql_pdp/remoteEntry.js',
        gql_products: path.resolve('../products-repo/public/remoteEntry.js'),
        gql_recommendations: path.resolve('../recommendations-repo/public/remoteEntry.js')
      },
      shared: [
        '@apollo/federation',
        'apollo-server',
        'apollo-server-micro'
      ]
    })
  ]
}
