const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {
  devtool: 'source-map',
  entry: [
    'webpack-hot-middleware/client?reload=true',
    path.resolve( __dirname, 'example/src/main.js' ),
  ],
  output: {
    path: path.resolve( __dirname, 'example/dist' ),
    filename: 'bundle.js',
    publicPath: '/assets/',
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEBUG__: true,
    }),
  ],
  resolve: {
    extensions: [ '', '.js', '.jsx' ],
    alias: {
      app: path.resolve( __dirname, 'example/src' ),
      repo: path.resolve( __dirname ),
    },
  },
  module: {
    /*preLoaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'eslint',
        include: [
          path.resolve( __dirname, 'src' ),
          // comment out for now until we fix all the coding styles
          // path.resolve( __dirname, 'example/src' ),
        ],
      },
    ],*/
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loaders: [ 'babel' ],
        include: [
          path.resolve( __dirname, 'src' ),
          path.resolve( __dirname, 'example/src' ),
        ],
      },
      {
        test: /\.(less|css)$/,
        loader: 'style!css!less',
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream',
      },
      {
        test: /\.(eot|png)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml',
      },
    ],
  },
};
