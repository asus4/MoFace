/*global module __dirname process */

const path = require('path')
const webpack = require('webpack')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')


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
          options: {presets: ['env']}
        }
      },
      {test: /\.json$/, loader: 'json-loader'},
      {test: /\.(glsl|frag|vert)$/, loader: 'raw-loader', exclude: /node_modules/},
      {test: /\.(glsl|frag|vert)$/, loader: 'glslify-loader', exclude: /node_modules/}
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'web_modules'), 'node_modules'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  plugins: [
    new BrowserSyncPlugin({
      host: '0.0.0.0',
      server: { baseDir: ['public'] },
      https: true,
      injectChanges: true,
      files: ['public/**/*.html', 'public/**/*.css'],
      open: false,
    }),
    new webpack.ProvidePlugin({'THREE': 'three'}),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
  ]
}

if (production) {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      extractComments: true
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new CompressionPlugin({test: /\.(js)$/})
  )
} else {
  // config.devtool = 'inline-source-map' // this might be heavy..
  config.devtool = 'source-map'
}

module.exports = config
