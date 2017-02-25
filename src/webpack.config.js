import _ from 'lodash';
import path from 'path';
import gutil from 'gulp-util';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import helper from './webpack-helper';
import { readPackageJson } from './package';

const DEFAULT_OPTIONS = {
  entry: 'index.js',
  outputPath: './dist',
  publicPath: '/',
};

const DEFAULT_BABEL_OPTIONS = {
  presets: [
    ['es2015', { modules: false }],
    "react",
    "stage-0",
  ]
};

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

  let babelLoader = {
    loader: 'babel-loader',
    query: options.babel || DEFAULT_BABEL_OPTIONS,
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
              query: DEFAULT_IMAGEMIN_OPTIONS
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
