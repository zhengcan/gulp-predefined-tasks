import _ from 'lodash';
import path from 'path';
import pump from 'pump';
import gutil from 'gulp-util';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
// import webpackDevMiddleware from 'webpack-dev-middleware';
// import webpackHotMiddleware from 'webpack-hot-middleware';
// import browserSync from 'browser-sync';
import { createDevConfig, createProdConfig, createWatchConfig } from './webpack.config';
import { readPackageJson } from './package';

const DEFAULT_BABEL = {
  presets: [
    ['es2015', { modules: false }],
    'react',
    'stage-0',
  ],
  env: {
    watch: {
      plugins: [
        "react-hot-loader/babel",
      ],
    }
  },
};

const DEFAULT_DEV_SERVER = {
  host: '0.0.0.0',
  port: 3000,
  hot: true,
  publicPath: '/',
  headers: { 'Access-Control-Allow-Origin': '*' },
  stats: {
    colors: true,
    timings: true,
    chunks: false,
    hash: false,
    version: false,
  },
};

function resolveConfig(config) {
  if (!config) {
    return null;
  } else if (typeof config === 'string') {
    return require(path.join(process.cwd(), config)).default;
  } else if (typeof config === 'object') {
    return config;
  } else {
    throw new gutil.PluginError(taskName, 'Unknown webpack config: ' + config);
  }
}

function rewriteEntryForHMR(prepend) {
  return (entry) => {
    if (typeof entry === 'string') {
      return _.concat(prepend, entry);
    } else if (typeof entry === 'array') {
      return _.concat(prepend, entry);
    } else {
      console.warn('Unknown entry value: ' + entry);
    }
  };
}

function concatArray(objValue, srcValue) {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

function onMerge(object, ...sources) {
  return _.mergeWith(object, ...sources, concatArray);
}

function onConfig(config) {
  return config;
}

function prepareConfig(options, webpackOptions, mode, configFactory, rewriteEntry) {
  let { type, srcDir, distDir } = options;
  let packageJson = readPackageJson();

  // Prepare default output setting
  let outputPath = path.join(process.cwd(), distDir);
  let output = null;
  if (type === 'lib') {
    output = {
      path: outputPath,
      filename: `${packageJson.name}${mode === 'prod' ? '.min' : ''}.js`,
      libraryTarget: 'umd',
      library: packageJson.name
    };
  } else if (type === 'web') {
    output = {
      filename: '[name].bundle.js',
      path: outputPath,
      publicPath: '/',
    };
  } else {
    throw new gutil.PluginError('webpack', 'Unknown type ' + type);
  }

  // Prepare default config
  let defaultConfig = null;
  if (webpackOptions) {
    defaultConfig = _.merge({
      entry: webpackOptions.entry,
      output,
    }, configFactory({
      babel: webpackOptions.babel || DEFAULT_BABEL
    }));
  } else {
    defaultConfig = _.merge({
      entry: path.join(srcDir, 'index.js'),
      output,
    }, configFactory({
      babel: DEFAULT_BABEL
    }));
  }
  // console.log(webpackOptions);
  // console.log('!!!! default config');
  // console.log(defaultConfig);

  // Merge all config objects
  let mergedConfig = defaultConfig;
  if (webpackOptions) {
    let modeConfig = webpackOptions[mode + 'Config'];
    let resolvedModeConfig = resolveConfig(modeConfig);
    // console.log('!!!! resolved mode config');
    // console.log(resolvedModeConfig);
    let resolvedConfig = resolveConfig(webpackOptions.config);
    // console.log('!!!! resolved config');
    // console.log(resolvedConfig);
    mergedConfig = (webpackOptions.onMerge || onMerge)(
      {}, defaultConfig, resolvedConfig, resolvedModeConfig
    );
  }

  // Rewrite entry
  if (webpackOptions && typeof webpackOptions.onEntry === 'function') {
    rewriteEntry = webpackOptions.onEntry;
  }
  if (rewriteEntry) {
    let entry = mergedConfig.entry;
    if (typeof entry === 'string' || typeof entry === 'array') {
      entry = rewriteEntry(entry);
    } else if (typeof entry === 'object') {
      entry = _.mapValues(entry, rewriteEntry);
    } else {
      console.warn('Unknown entry value: ' + entry);
    }
    mergedConfig.entry = entry;
  }

  let result = (webpackOptions.onConfig || onConfig)(mergedConfig);
  return result || mergedConfig;
}

function runWebpack(taskName, config, cb) {
  let bundler = webpack(config);

  bundler.run((err, stats) => {
    if (err) {
      throw new gutil.PluginError(taskName, err);
    }

    gutil.log(stats.toString(config.stats));

    if (stats.hasErrors()) {
      cb(`Webpack failed in '${gutil.colors.cyan(taskName)}'`);
    } else {
      cb();
    }
  });
}

export default (gulp, options) => {
  if (!webpack) {
    throw new gutil.PluginError('gulp', 'Unable to load "webpack" module.');
  }

  let { type, srcDir, distDir, webpack: webpackOptions } = options;

  gulp.task('webpack:dev', [`webpack:${type}:dev`]).desc('run webpack in dev mode');
  gulp.task('webpack:prod', [`webpack:${type}:prod`]).desc('run webpack in prod mode');
  gulp.task('webpack:watch', [`webpack:${type}:watch`]).desc('watch and run webpack in dev & watch mode');

  gulp.task(`webpack:${type}:dev`, (cb) => {
    if (process.env.NODE_ENV) {
      if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== '') {
        gutil.log(gutil.colors.red('NODE_ENV is not "development", which may produce invalid artifacts.'));
      }
    }

    let config = prepareConfig(options, webpackOptions, 'dev', createDevConfig);
    runWebpack(`webpack:${type}:dev`, config, cb);
  });

  gulp.task(`webpack:${type}:prod`, (cb) => {
    if (process.env.NODE_ENV !== 'production') {
      gutil.log(gutil.colors.red('NODE_ENV is not "production", which may produce invalid artifacts.'));
    }

    let config = prepareConfig(options, webpackOptions, 'prod', createProdConfig);
    runWebpack(`webpack:${type}:prod`, config, cb);
  });

  gulp.task(`webpack:${type}:watch`, (cb) => {
    if (process.env.NODE_ENV !== 'watch') {
      gutil.log(gutil.colors.red('NODE_ENV is not "watch", which may produce invalid artifacts.'));
    }

    let devServer = DEFAULT_DEV_SERVER;
    if (webpackOptions && webpackOptions.devServer) {
      devServer = _.merge({}, devServer, webpackOptions.devServer);
    }

    let { host, port } = devServer;
    let hostInLink = host === '0.0.0.0' ? 'localhost' : host;

    let config = prepareConfig(options, webpackOptions, 'watch', createWatchConfig, rewriteEntryForHMR([
      // necessary for hot reloading with IE
      'eventsource-polyfill',
      // activate HMR for React
      'react-hot-loader/patch',
      // bundle the client for webpack-dev-server and connect to the provided endpoint
      `webpack-dev-server/client?http://${hostInLink}:${port}`,
      // bundle the client for hot reloading only- means to only hot reload for successful updates
      'webpack/hot/only-dev-server',
    ]));

    let bundler = webpack(config);

    new WebpackDevServer(bundler, devServer).listen(port, host, (err) => {
      if (err) {
        throw new gutil.PluginError("webpack-dev-server", err);
      }
      let path = '/index.html';
      if (!_.isEmpty(devServer.index)) {
        path = _.startsWith(devServer.index, '/') ? devServer.index : '/' + devServer.index;
      }
      gutil.log(gutil.colors.yellow('[DevServer]'), `http://${hostInLink}:${port}${path}`);
    });
  });
}
