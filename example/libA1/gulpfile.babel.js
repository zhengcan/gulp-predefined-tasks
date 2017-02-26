import gulp from 'gulp';
import registerTasks from 'gulp-predefined-tasks';

let options = {
  type: 'lib',
  webpack: false,
};
registerTasks(gulp, options);
