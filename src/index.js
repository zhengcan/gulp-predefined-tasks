// Modules
import moduleLib from './lib';
import moduleDist from './dist';
import moduleWatch from './watch';
import moduleWebpack from './webpack';
import moduleSubProject from './subproject';

// Dependencies
import _ from 'lodash';
import pump from 'pump';
import gutil from 'gulp-util';
import taskListing from 'gulp-task-listing';

// Default options
const DEFAULT_OPTIONS = {
  type: 'web',    // 'web' or 'lib'
  srcDir: './src/',
  libDir: './lib/',
  distDir: './dist/',
};

export default function registryTasks(gulp, options) {
  options = _.merge(DEFAULT_OPTIONS, options);
  let { srcDir } = options;

  let src = (globs, options) => {
    if (typeof globs === 'array') {
      return gulp.src(_.map(globs, l => srcDir + l), options);
    } else {
      return gulp.src(srcDir + globs, options);
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
    src, dest, watch,
    task: (...args) => {
      return gulp.task(...args);
    }
  };

  gulp.task('help', taskListing);

  gulp.task('build:all', ['build:lib', 'build:dist']);

  moduleLib(enhancedGulp, options);
  moduleDist(enhancedGulp, options);
  moduleWatch(enhancedGulp, options);
  moduleWebpack(enhancedGulp, options);
  moduleSubProject(enhancedGulp, options);
}
