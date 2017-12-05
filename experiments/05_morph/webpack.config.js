/*global module __dirname process */

const webpack = require('webpack')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

const production = process.env.NODE_ENV === 'production'

const config = {
  entry: './src/main.js',
  output: {path: `${__dirname}/public`, filename: 'bundle.js'},
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
          }
        }
      },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.(glsl|frag|vert)$/, loader: 'raw-loader', exclude: /node_modules/ },
      { test: /\.(glsl|frag|vert)$/, loader: 'glslify-loader', exclude: /node_modules/ }
    ]
  },
  devtool: 'inline-source-map',
  plugins: [
    new BrowserSyncPlugin({
      host: '0.0.0.0',
      port: 3000,
      server: { baseDir: ['public'] },
      https: true
    }),
    new webpack.ProvidePlugin({'THREE': 'three'})
  ]
}

if (production) {
  config.plugins.push(
    new webpack.optimize.AggressiveMergingPlugin()
  )
}

module.exports = config
