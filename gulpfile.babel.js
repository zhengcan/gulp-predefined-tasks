import gulp from 'gulp';
import babel from 'gulp-babel';

import registryTasks from './src';

let options = {
  type: 'lib',
  webpack: {
    entry: {
      index: '../example/app/src/index.js'
    }
  }
};
registryTasks(gulp, options);

gulp.task('default', ['build:lib', 'build:dist']);

gulp.task('watch', ['build:lib:js', 'watch:lib:js']);
