import gulp from 'gulp';
import babel from 'gulp-babel';

import registerTasks from './src';

let options = {
  type: 'lib'
};
registerTasks(gulp, options);

gulp.task('default', ['build:lib', 'build:dist']);
