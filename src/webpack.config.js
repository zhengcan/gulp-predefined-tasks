import _ from 'lodash';
import path from 'path';
import gutil from 'gulp-util';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';

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
          use: [
            'url-loader',
            {
              loader: 'image-webpack-loader',
              options: DEFAULT_IMAGEMIN_OPTIONS
            }
          ]
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

export function createDevConfig(options) {
  let baseConfig = createBaseConfig(options);
  return _.merge(baseConfig, {
    plugins: _.concat(baseConfig.plugins || [], [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development',
      }),
    ]),
  });
}

export function createProdConfig(options) {
  let baseConfig = createBaseConfig(options);
  return _.merge(baseConfig, {
    plugins: _.concat(baseConfig.plugins || [], [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
      }),
  		new webpack.optimize.UglifyJsPlugin({
        compressor: {
          warnings: false
        }
      }),
    ]),
  });
}

export function createWatchConfig(options) {
  let baseConfig = createBaseConfig(options);
  return _.merge(baseConfig, {
    plugins: _.concat(baseConfig.plugins || [], [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'watch',
      }),
      // enable HMR globally
      new webpack.HotModuleReplacementPlugin(),
      // prints more readable module names in the browser console on HMR updates
      new webpack.NamedModulesPlugin(),
    ]),
  });
}
