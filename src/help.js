import chalk from 'chalk';

const DEFAULT_SUBTASK_REGEX = /[-_:]/;

function filter(inc, subtaskFilter) {
  return function(n) {
    var isSubtask = subtaskFilter(n);
    return (inc && isSubtask) || (!inc && !isSubtask);
  }
}

function header(text) {
  console.log('');
  console.log(chalk.gray(text));
  console.log('------------------------------');
}

function regexFunc(rfn) {
  if(rfn && typeof rfn !== "function") {
    return function(t) {
      return t.search(rfn) !== -1;
    };
  }
  return rfn;
}

function help(gulp, subtaskFilter, excludeFilter) {
  subtaskFilter = regexFunc(subtaskFilter || DEFAULT_SUBTASK_REGEX);
  excludeFilter = regexFunc(excludeFilter);

  return function(cb) {
    var tasks = Object.keys(gulp.tasks).sort();
    if(excludeFilter) {
      tasks = tasks.filter(function(task) {
        return !excludeFilter(task);
      });
    }

    header('Main Tasks');

    tasks.filter(filter(false, subtaskFilter)).forEach(function(name) {
      let desc = gulp.tasks[name].desc;
      console.log('    ' + chalk.cyan(name) + (desc ? ' - ' + desc : ''));
    });

    var subtasks = tasks.filter(filter(true, subtaskFilter));

    if(subtasks.length) {
      header('Sub Tasks');

      subtasks.forEach(function(name) {
        let desc = gulp.tasks[name].desc;
        console.log('    ' + chalk.cyan(name) + (desc ? ' - ' + desc : ''));
      });
    }

    console.log('');

    // we're synchronous
    cb && cb();
  };
}

export default (gulp, options) => {
  gulp.task('help', help(gulp));
}
