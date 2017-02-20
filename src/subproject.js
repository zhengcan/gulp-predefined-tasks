import _ from 'lodash';
import path from 'path';
import pump from 'pump';
import gutil from 'gulp-util';
// import shell from 'gulp-shell';
// import exec from 'gulp-exec';
import { exec } from 'child_process';

function pipeWith(from, to, prefix) {
  let lastLine = null;
  from.on('data', (chunk) => {
    let hasEnd = _.endsWith(chunk, '\n');
    if (lastLine) {
      chunk = lastLine + chunk;
      lastLine = null;
    }

    let lines = chunk.split('\n');
    if (!hasEnd) {
      lastLine = lines.pop();
    } else {
      lines.pop();
    }

    _.forEach(lines, line => {
      to.write(`[${gutil.colors.yellow(prefix)}] ${_.trimEnd(line)}\n`);
    });
  });
}

export default (gulp, options) => {
  let projectDir = process.cwd();
  let pkg = require(path.join(projectDir, './package.json'));

  gulp.task('deps', ['build:deps']);

  gulp.task('build:deps', (cb) => {
    let dependencies = _.map(pkg.dependencies, (value, name) => { return { name, value }; });
    let fileDeps = _.filter(dependencies, d => _.startsWith(d.value, 'file:'));
    let linkDeps = _.filter(dependencies, d => _.startsWith(d.value, 'link:'));

    let deps = [];

    deps = _.concat(deps, _.map(fileDeps, d => {
      return new Promise((resolve, reject) => {
        let relativePath = d.value.substr('file:'.length);
        let child = exec('yarn run build:deps', {
          cwd: path.join(projectDir, relativePath)
        }, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve(d.name);
          }
        });

        pipeWith(child.stdout, process.stdout, d.name)
        pipeWith(child.stderr, process.stderr, d.name);
      });
    }));

    Promise.all(deps).then(o => cb());
  });
}
