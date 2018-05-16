
const path = require('path');

module.exports = {
  entry: './js/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname,  'public')
  },
   devtool: 'cheap-eval-source-map',
  watch: true,
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: /js/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [require('babel-plugin-transform-class-properties')]
          }
        }
      }
    ]
  },
   devServer:{
    port: 3000,
      contentBase: './public'
    }
};