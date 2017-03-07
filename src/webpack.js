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
import * as constant from './constant';

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

const MODE_DEV = 'dev';
const MODE_PROD = 'prod';
const MODE_WATCH = 'watch';

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
  return (mode, entry) => {
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

function onMerge(mode, object, ...sources) {
  return _.mergeWith(object, ...sources, concatArray);
}

function prepareConfig(options, webpackOptions, mode, configFactory, rewriteEntry) {
  let { type, srcDir, distDir, packageJson } = options;

  // Prepare default output setting
  let outputPath = path.join(process.cwd(), distDir);
  let output = null;
  if (type === constant.TYPE_LIB) {
    output = {
      path: outputPath,
      filename: `[name]${mode === MODE_PROD ? '.min' : ''}.js`,
      libraryTarget: 'umd',
      library: packageJson.name
    };
  } else if (type === constant.TYPE_WEB) {
    output = {
      filename: '[name].bundle.js',
      path: outputPath,
      publicPath: '/',
    };
  } else {
    throw new gutil.PluginError('webpack', 'Unknown type ' + type);
  }

  // Prepare default config
  let defaultConfig = _.merge({
    entry: webpackOptions.entry || ('./' + path.join(srcDir, 'index.js')),
    output: output,
  }, configFactory({
    babel: webpackOptions.babel || constant.getWebpackBabelOptions(options.hasReact)
  }));

  // Merge all config objects
  let mergedConfig = defaultConfig;
  let modeConfig = webpackOptions[mode + 'Config'];
  let resolvedModeConfig = resolveConfig(modeConfig);
  let resolvedConfig = resolveConfig(webpackOptions.config);
  mergedConfig = (webpackOptions.onMerge || onMerge)(
    mode, {}, defaultConfig, resolvedConfig, resolvedModeConfig
  );

  // Rewrite entry
  if (typeof webpackOptions.onEntry === 'function') {
    rewriteEntry = webpackOptions.onEntry;
  }
  if (rewriteEntry) {
    let entry = mergedConfig.entry;
    if (typeof entry === 'string' || typeof entry === 'array') {
      entry = rewriteEntry(mode, entry);
    } else if (typeof entry === 'object') {
      entry = _.mapValues(entry, e => rewriteEntry(mode, e));
    } else {
      console.warn('Unknown entry value: ' + entry);
    }
    mergedConfig.entry = entry;
  }

  // Check and fix output.path
  if (_.startsWith(mergedConfig.output.path, './')) {
    mergedConfig.output.path = path.join(process.cwd(), mergedConfig.output.path);
  }

  // Convert config
  if (typeof webpackOptions.onConfig === 'function') {
    let result = webpackOptions.onConfig(mode, mergedConfig);
    if (result) {
      return result;
    }
  }

  return mergedConfig;
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
  let { type, srcDir, distDir, webpack: webpackOptions, argv } = options;
  if (!webpackOptions) {
    // Skip all webpack tasks
    return;
  }

  if (!webpack) {
    throw new gutil.PluginError('gulp', 'Unable to load "webpack" module.');
  }

  // Parse argv
  if (argv.outputFilename) {
    webpackOptions = _.merge({}, webpackOptions, {
      config: {
        output: {
          filename: argv.outputFilename
        }
      }
    });
  }
  if (argv.port) {
    webpackOptions = _.merge({}, webpackOptions, {
      devServer: {
        port: argv.port
      }
    });
  }
  if (argv.proxy) {
    webpackOptions = _.merge({}, webpackOptions, {
      devServer: {
        proxy: {
          '/': {
            target: argv.proxy
          }
        }
      }
    });
  }

  // Register tasks
  gulp.task('webpack:dev', [`webpack:${type}:dev`]).desc('run webpack in dev mode');
  gulp.task('webpack:prod', [`webpack:${type}:prod`]).desc('run webpack in prod mode');
  gulp.task('webpack:watch', [`webpack:${type}:watch`]).desc('watch and run webpack in dev & watch mode');

  gulp.task(`webpack:${type}:dev`, (cb) => {
    if (process.env.NODE_ENV) {
      if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== '') {
        gutil.log(gutil.colors.red('NODE_ENV is not "development", which may produce invalid artifacts.'));
      }
    }

    let config = prepareConfig(options, webpackOptions, MODE_DEV, createDevConfig);
    runWebpack(`webpack:${type}:dev`, config, cb);
  });

  gulp.task(`webpack:${type}:prod`, (cb) => {
    if (process.env.NODE_ENV !== 'production') {
      gutil.log(gutil.colors.red('NODE_ENV is not "production", which may produce invalid artifacts.'));
    }

    let config = prepareConfig(options, webpackOptions, MODE_PROD, createProdConfig);
    runWebpack(`webpack:${type}:prod`, config, cb);
  });

  gulp.task(`webpack:${type}:watch`, (cb) => {
    if (process.env.NODE_ENV !== 'watch') {
      gutil.log(gutil.colors.red('NODE_ENV is not "watch", which may produce invalid artifacts.'));
    }

    let devServer = _.merge({}, DEFAULT_DEV_SERVER, webpackOptions.devServer);
    let { host, port } = devServer;
    let hostInLink = host === '0.0.0.0' ? 'localhost' : host;

    if (!webpackOptions.watchConfig) {
      webpackOptions.watchConfig = webpackOptions.devConfig;
    }
    let hmrPrepend = _.compact([
      // necessary for hot reloading with IE
      'eventsource-polyfill',
      // activate HMR for React
      options.hasReact ? 'react-hot-loader/patch' : null,
      // bundle the client for webpack-dev-server and connect to the provided endpoint
      `webpack-dev-server/client?http://${hostInLink}:${port}`,
      // bundle the client for hot reloading only- means to only hot reload for successful updates
      'webpack/hot/only-dev-server',
    ]);
    let config = prepareConfig(options, webpackOptions, MODE_WATCH, createWatchConfig, rewriteEntryForHMR(hmrPrepend));

    let bundler = webpack(config);

    if (webpackOptions.devServer
      && !webpackOptions.devServer.publicPath) {
      devServer.publicPath = config.output.publicPath;
    }

    let proxy = devServer.proxy;
    let proxyTarget = null;
    if (proxy && proxy['/'] && proxy['/'].target) {
      proxyTarget = proxy['/'].target;
    }

    new WebpackDevServer(bundler, devServer).listen(port, host, (err) => {
      if (err) {
        throw new gutil.PluginError("webpack-dev-server", err);
      }

      let path = '/';
      if (!_.isEmpty(devServer.index)) {
        path = _.startsWith(devServer.index, '/') ? devServer.index : '/' + devServer.index;
      }
      if (proxyTarget) {
        gutil.log(
          gutil.colors.yellow('[DevServer]'),
          `http://${hostInLink}:${port}${path}  >>  ${proxyTarget}`
        );
      } else {
        gutil.log(
          gutil.colors.yellow('[DevServer]'),
          `http://${hostInLink}:${port}${path}`
        );
      }
    });
  });
}
