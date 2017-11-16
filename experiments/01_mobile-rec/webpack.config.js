/*global module __dirname */

module.exports = {
  entry: './src/main.js',
  output: {path: `${__dirname}/public`, filename: 'bundle.js'},
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env'],
        }
      }
    }]
  },
  devtool: 'inline-source-map',  
  devServer: {
    contentBase: 'public',
    host: '0.0.0.0',
    inline: true,
    https: true,
    // hot: true,
    // port: 8000,
  },
}
