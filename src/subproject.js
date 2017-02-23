import _ from 'lodash';
import path from 'path';
import pump from 'pump';
import gutil from 'gulp-util';
import { exec } from 'child_process';
import { readPackageJson } from './package';

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
  gulp.task('build:deps', (cb) => {
    let pkg = readPackageJson();
    let dependencies = _.map(pkg.dependencies, (value, name) => { return { name, value }; });
    let fileDeps = _.filter(dependencies, d => _.startsWith(d.value, 'file:'));
    let linkDeps = _.filter(dependencies, d => _.startsWith(d.value, 'link:'));

    let command = _.join(process.argv, ' ');
    let deps = [];

    deps = _.concat(deps, _.map(fileDeps, d => {
      return new Promise((resolve, reject) => {
        let relativePath = d.value.substr('file:'.length);
        let child = exec(command, {
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
  }).desc('build project with dependencies.');
}
