import chalk from 'chalk';
import _ from 'lodash';

function header(text) {
  console.log('');
  console.log(chalk.gray(text));
  console.log('------------------------------');
}

function help(gulp, subtaskFilter, excludeFilter) {
  return function(cb) {
    let tasks = _(gulp.tasks).partition(task => {
      task.level = _.countBy(task.name, c => c === ':').true || 0;
      return task.level === 0;
    }).value();

    header('Main Tasks');

    _(tasks[0]).sortBy('name').forEach(task => {
      let desc = task.desc;
      console.log('    ' + chalk.cyan(task.name) + (desc ? ' - ' + desc : ''));
    });

    if (tasks[1] && tasks[1].length > 0) {
      header('Sub Tasks');

      _(tasks[1]).sortBy('name').forEach(task => {
        let desc = task.desc;
        console.log('    ' + (task.level > 1 ? '  ' : '') + chalk.cyan(task.name) + (desc ? ' - ' + desc : ''));
      });
    }

    console.log('');

    cb && cb();
  };
}

export default (gulp, options) => {
  gulp.task('help', help(gulp)).desc('show help');
}
