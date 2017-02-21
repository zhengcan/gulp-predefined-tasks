import _ from 'lodash';
import path from 'path';
import gutil from 'gulp-util';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import helper from './webpackHelper';
import { readPackageJson } from './package';

const DEFAULT_OPTIONS = {
  entry: 'index.js',
  outputPath: './dist',
  publicPath: '/',
};

function buildConfig(options) {
  let { type, srcDir, entry, outputPath, publicPath, libraryTarget, externals, isProd } = options;
  let packageJson = readPackageJson();

  entry = helper.initEntry(entry, srcDir);
  outputPath = path.join(process.cwd(), outputPath);

  let output = null;
  if (type === 'web') {
    output = {
      filename: '[name].bundle.js',
      path: outputPath,
      publicPath: publicPath,
    };
  } else if (type === 'lib') {
    if (typeof isProd === undefined) {
      isProd = process.env.NODE_ENV === 'production';
    }
    output = {
      path: outputPath,
      filename: `${packageJson.name}${isProd ? ".min" : ""}.js`,
      libraryTarget: libraryTarget || 'umd',
      library: packageJson.name
    };
  } else {
    throw new gutil.PluginError('webpack', 'Unknown type ' + type);
  }

  let hasReact = _.includes(packageJson.dependencies, 'react')
    || _.includes(packageJson.devDependencies, 'react');

  return {
    entry,
    output,
    publicPath,
    externals,
    hasReact,
  };
}

function createBaseConfig(options) {
  let config = buildConfig(options);
  return {
    entry: config.entry,
    output: config.output,
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.css', '.less'],
    },
    devtool: 'inline-source-map',
    // devtool: 'eval-source-map',
    externals: config.externals,
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: [
            'babel-loader',
          ],
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader?modules',
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    require('autoprefixer')
                  ];
                }
              }
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            'style-loader',
            'css-loader?modules',
            'less-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    require('autoprefixer')
                  ];
                }
              }
            },
          ],
        },
        {
          test: /\.png$/,
          use: [
            'url-loader?mimetype=image/png',
          ],
        },
        {
          test: /\.jpe?g$/,
          use: [
            'url-loader?mimetype=image/jpeg',
          ],
        },
        {
          test: /\.gif$/,
          use: [
            'url-loader?mimetype=image/gif',
          ],
        },
        {
          test: /\.svg$/,
          use: [
            'svg-url-loader',
          ],
        },
      ],
    },
    stats: {
      colors: true,
      reasons: false,
      hash: false,
      version: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      cached: false,
      cachedAssets: false,
    },
  };
}

export function createDevConfig(options) {
  let baseConfig = createBaseConfig(options);
  return _.merge(baseConfig, {
    plugins: _.concat(baseConfig.plugins || [], [
      new webpack.DefinePlugin({
  			"process.env": { "NODE_ENV": JSON.stringify("development") }
  		}),
    ]),
  });
}

export function createProdConfig(options) {
  let baseConfig = createBaseConfig(options);
  return _.merge(baseConfig, {
    plugins: _.concat(baseConfig.plugins || [], [
      new webpack.DefinePlugin({
  			"process.env": { "NODE_ENV": JSON.stringify("production") }
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
      new webpack.DefinePlugin({
  			"process.env": { "NODE_ENV": JSON.stringify("watch") }
  		}),
      // enable HMR globally
      new webpack.HotModuleReplacementPlugin(),
      // prints more readable module names in the browser console on HMR updates
      new webpack.NamedModulesPlugin(),
    ]),
  });
}
