import _ from 'lodash';
import path from 'path';
import gutil from 'gulp-util';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
// import DashboardPlugin from 'webpack-dashboard/plugin';

const DEFAULT_IMAGEMIN_OPTIONS = {
  gifsicle: {
  },
  mozjpeg: {
  },
  optipng: {
  },
  pngquent: {
  },
  svgo: {
  }
};

function createBaseConfig(options) {
  let babelLoader = {
    loader: 'babel-loader',
    options: options.babel,
  };
  let styleLoader = {
    loader: 'style-loader',
  };
  let cssLoader = {
    loader: 'css-loader',
    options: {
      modules: false,
      importLoaders: 2
    }
  };
  let lessLoader = {
    loader: 'less-loader',
  };
  let postcssLoader = {
    loader: 'postcss-loader',
    options: {
      plugins: function () {
        return [
          require('autoprefixer')
        ];
      }
    }
  };
  let imageLoader = null;
  try {
    let imageWebpackLoader = require('image-webpack-loader');
    let imageLoader = {
      loader: 'image-webpack-loader',
      options: DEFAULT_IMAGEMIN_OPTIONS
    };
  } catch (e) {}

  return {
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.css', '.less'],
    },
    devtool: 'inline-source-map',
    // devtool: 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: [
            babelLoader,
          ],
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            styleLoader,
            cssLoader,
            postcssLoader,
          ],
        },
        {
          test: /\.less$/,
          use: [
            styleLoader,
            cssLoader,
            lessLoader,
            postcssLoader,
          ],
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          use: _.compact([
            'url-loader',
            imageLoader,
          ])
        },
        {
          test: /\.(eot|ttf|woff2?|svg)(\?.+)?$/,
          use: [
            'file-loader'
          ]
        },
      ],
    },
    stats: {
      colors: true,
      timings: true,
      chunks: false,
      hash: false,
      version: false,
    },
  };
}

export function createDevConfig(options = {}) {
  let baseConfig = createBaseConfig(options);
  return _.merge(baseConfig, {
    plugins: _.concat(baseConfig.plugins || [], [
      // new webpack.EnvironmentPlugin({
      //   NODE_ENV: 'development',
      // }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development')
      }),
    ]),
  });
}

export function createProdConfig(options = {}) {
  let baseConfig = createBaseConfig(options);
  return _.merge(baseConfig, {
    plugins: _.concat(baseConfig.plugins || [], [
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      // new webpack.EnvironmentPlugin({
      //   NODE_ENV: 'production',
      // }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
  		new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        compress: {
          sequences     : true,  // join consecutive statemets with the “comma operator”
          properties    : true,  // optimize property access: a["foo"] → a.foo
          dead_code     : true,  // discard unreachable code
          drop_debugger : true,  // discard “debugger” statements
          unsafe        : false, // some unsafe optimizations (see below)
          conditionals  : true,  // optimize if-s and conditional expressions
          comparisons   : true,  // optimize comparisons
          evaluate      : true,  // evaluate constant expressions
          booleans      : true,  // optimize boolean expressions
          loops         : true,  // optimize loops
          unused        : true,  // drop unused variables/functions
          hoist_funs    : true,  // hoist function declarations
          hoist_vars    : false, // hoist variable declarations
          if_return     : true,  // optimize if-s followed by return/continue
          join_vars     : true,  // join var declarations
          cascade       : true,  // try to cascade `right` into `left` in sequences
          side_effects  : true,  // drop side-effect-free statements
          warnings      : false, // warn about potentially dangerous optimizations/code
        },
        comments: false,
      }),
    ]),
  });
}

export function createWatchConfig(options = {}) {
  let baseConfig = createBaseConfig(options);
  return _.merge(baseConfig, {
    plugins: _.concat(baseConfig.plugins || [], [
      // new webpack.EnvironmentPlugin({
      //   NODE_ENV: 'watch',
      // }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('watch')
      }),
      // enable webpack-dashboard
      // new DashboardPlugin(),
      // enable HMR globally
      new webpack.HotModuleReplacementPlugin(),
      // prints more readable module names in the browser console on HMR updates
      new webpack.NamedModulesPlugin(),
    ]),
  });
}
