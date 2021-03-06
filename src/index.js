// Modules
import moduleHelp from './help';
import moduleClean from './clean';
import moduleLib from './lib';
import moduleDist from './dist';
import moduleWatch from './watch';
import moduleWebpack from './webpack';
import moduleLint from './lint';
import moduleTest from './test';
import moduleRecursive from './recursive';

// Dependencies
import _ from 'lodash';
import pump from 'pump';
import gutil from 'gulp-util';
import yargs from 'yargs';
import * as constant from './constant';
import { readPackageJson } from './package';

let packageJson = readPackageJson();
let hasReact = _.has(packageJson, 'dependencies.react')
  || _.has(packageJson, 'devDependencies.react')
  || _.has(packageJson, 'peerDependencies.react');

// Default options
const DEFAULT_OPTIONS = {
  type: constant.TYPE_WEB,    // 'web' or 'lib'
  srcDir: './src/',
  testDir: './test/',
  libDir: './lib/',
  distDir: './dist/',
  babel: constant.getBabelOptions(hasReact),
  webpack: false,   // disable webpack as default
};

function prepareOptions(options) {
  options = _.merge(DEFAULT_OPTIONS, options);
  options.packageJson = packageJson;
  options.hasReact = hasReact;
  let argv = options.argv = yargs.argv;

  if (argv.libDir) {
    options.libDir = argv.libDir;
  }
  if (argv.distDir) {
    options.distDir = argv.distDir;
  }
  return options;
}

function registerTasks(gulp, options) {
  options = prepareOptions(options);
  let { type, srcDir, testDir, webpack: webpackOptions } = options;

  let src = (globs, options) => {
    if (typeof globs === 'array') {
      return gulp.src(_.map(globs, l => srcDir + l), options);
    } else {
      return gulp.src(srcDir + globs, options);
    }
  };
  let testSrc = (globs, options) => {
    if (typeof globs === 'array') {
      return gulp.src(_.map(globs, l => testDir + l), options);
    } else {
      return gulp.src(testDir + globs, options);
    }
  };
  let dest = (globs, options) => {
    if (typeof globs === 'array') {
      return gulp.dest(_.map(globs, l => l), options);
    } else {
      return gulp.dest(globs, options);
    }
  };
  let watch = (globs, options, tasksOrCb) => {
    if (typeof globs === 'array') {
      return gulp.watch(_.map(globs, l => srcDir + l), options, tasksOrCb);
    } else {
      return gulp.watch(srcDir + globs, options, tasksOrCb);
    }
  };

  let enhancedGulp = {
    src, testSrc, dest, watch,
    tasks: gulp.tasks,
    task: (name, ...args) => {
      let resp = gulp.task(name, ...args);
      let task = resp.tasks[name];
      resp.desc = (desc) => {
        task.desc = desc;
      };
      return resp;
    }
  };

  let useWebpack = (webpackOptions !== false);

  let moduleIndex = (gulp, options) => {
    gulp.task('default', ['help']).desc('show help');
    if (useWebpack) {
      if (type === constant.TYPE_LIB) {
        gulp.task('build:dev', ['build:lib', 'webpack:dev']).desc('build project in dev mode');
        gulp.task('build:watch', ['build:lib', 'watch:lib']).desc('watch and build project');
        gulp.task('watch', ['build:watch']).desc('watch and build project');
      } else {
        gulp.task('build:dev', ['webpack:dev']).desc('build project in dev mode');
        gulp.task('build:watch', ['webpack:watch']).desc('watch and build project');
        gulp.task('watch', ['webpack:watch']).desc('watch and build project');
      }
      gulp.task('build:prod', ['webpack:prod']).desc('build projet in prod mode');
    } else {
      gulp.task('build:dev', ['build:lib']).desc('build project in dev mode');
      gulp.task('build:watch', ['build:lib', 'watch:lib']).desc('watch and build project');
      gulp.task('watch', ['build:watch']).desc('watch and build project');
      gulp.task('build:prod', ['build:dist']).desc('build projet in prod mode');
    }
  }

  moduleIndex(enhancedGulp, options);
  moduleHelp(enhancedGulp, options);
  moduleClean(enhancedGulp, options);
  moduleLib(enhancedGulp, options);
  moduleDist(enhancedGulp, options);
  moduleWatch(enhancedGulp, options);
  useWebpack && moduleWebpack(enhancedGulp, options);
  moduleLint(enhancedGulp, options);
  moduleTest(enhancedGulp, options);
  moduleRecursive(enhancedGulp, options);

  // Return the enhanced gulp
  return enhancedGulp;
}

module.exports = registerTasks;
export default registerTasks;
