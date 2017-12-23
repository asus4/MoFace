/*global module __dirname process */

const path = require('path')
const webpack = require('webpack')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

const production = process.env.NODE_ENV === 'production'

const config = {
  entry: './src/index.js',
  output: {
    path: `${__dirname}/public`,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { // babel
        test: /\.js$/,
        exclude: /node_modules|web_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: ['dynamic-import-webpack']
          }
        }
      },
      {test: /\.json$/, loader: 'json-loader'},
      {test: /\.(glsl|frag|vert)$/, loader: 'raw-loader', exclude: /node_modules/},
      {test: /\.(glsl|frag|vert)$/, loader: 'glslify-loader', exclude: /node_modules/}
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'web_modules'), 'node_modules']
  },
  plugins: [
    new BrowserSyncPlugin({
      host: '0.0.0.0',
      server: { baseDir: ['public'] },
      https: true,
      injectChanges: true,
      open: false,
    }),
    new webpack.ProvidePlugin({'THREE': 'three'}),
  ]
}

if (production) {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  )
} else {
  config.devtool = 'inline-source-map' // this might be heavy..
  // config.devtool = 'source-map'
}

module.exports = config
