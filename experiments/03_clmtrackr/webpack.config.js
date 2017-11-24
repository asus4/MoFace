/*global module __dirname process */

const webpack = require('webpack')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

const production = process.env.NODE_ENV === 'production'

const config = {
  entry: './src/main.js',
  output: {path: `${__dirname}/public`, filename: 'bundle.js'},
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    }]
  },
  plugins: [
    new BrowserSyncPlugin({
      host: '0.0.0.0',
      port: 3000,
      server: { baseDir: ['public'] },
      https: true
    })
  ]
}

if (production) {
  config.plugins.push(
    // When uglify, following error occurs...
    // > Uncaught ReferenceError: module is not defined

    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // }),
    new webpack.optimize.AggressiveMergingPlugin()
  )
}
else {
  config.devtool = 'inline-source-map'
}

module.exports = config
