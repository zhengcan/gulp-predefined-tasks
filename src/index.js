// Modules
import moduleHelp from './help';
import moduleClean from './clean';
import moduleLib from './lib';
import moduleDist from './dist';
import moduleWatch from './watch';
import moduleWebpack from './webpack';
import moduleLint from './lint';
import moduleTest from './test';
import moduleSubProject from './subproject';

// Dependencies
import _ from 'lodash';
import pump from 'pump';
import gutil from 'gulp-util';

// Default options
const DEFAULT_OPTIONS = {
  type: 'web',    // 'web' or 'lib'
  srcDir: './src/',
  testDir: './test/',
  libDir: './lib/',
  distDir: './dist/',
  babel: {
    presets: ["es2015", "react", "stage-2"]
  }
};

function registerTasks(gulp, options) {
  options = _.merge(DEFAULT_OPTIONS, options);
  let { type, srcDir, testDir } = options;

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

  let moduleIndex = (gulp, options) => {
    gulp.task('default', ['help']).desc('show help');
    gulp.task('build:dev', ['build:lib', 'webpack:dev']).desc('build project in dev mode');
    gulp.task('build:prod', ['webpack:prod']).desc('build projet in prod mode');
  }

  moduleIndex(enhancedGulp, options);
  moduleHelp(enhancedGulp, options);
  moduleClean(enhancedGulp, options);
  moduleLib(enhancedGulp, options);
  moduleDist(enhancedGulp, options);
  moduleWatch(enhancedGulp, options);
  moduleWebpack(enhancedGulp, options);
  moduleLint(enhancedGulp, options);
  moduleTest(enhancedGulp, options);
  moduleSubProject(enhancedGulp, options);
}

module.exports = registerTasks;
export default registerTasks;
