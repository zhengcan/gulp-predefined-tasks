import _ from 'lodash';
import path from 'path';
import pump from 'pump';
import gutil from 'gulp-util';
import { exec } from 'child_process';
import { readPackageJson } from './package';

const THIS_PROJECT = 'gulp-predefined-tasks';

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
  gulp.task('with:deps', (cb) => {
    let command = _.join(process.argv, ' ');
    let packageJson = readPackageJson();

    let promises = _({})
      .merge(packageJson.dependencies, packageJson.linkDependencies)
      .map((value, name) => { return { name, value }; })
      .filter(d => _.startsWith(d.value, 'file:') || _.startsWith(d.value, 'link:'))
      .map(d => {
        d.relativePath = d.value.substr('file:'.length);
        d.absolutePath = path.join(process.cwd(), d.relativePath);
        return d;
      })
      .filter(d => {
        let pkg = require(path.join(d.absolutePath, './package.json'));
        return _.has(pkg.devDependencies, THIS_PROJECT)
          || _.has(pkg.dependencies, THIS_PROJECT);
      })
      .map(d => {
        return new Promise((resolve, reject) => {
          let child = exec(command, {
            cwd: d.absolutePath
          }, (error, stdout, stderr) => {
            if (error) {
              reject(error);
            } else {
              resolve(d.name);
            }
          });

          console.log(`[${gutil.colors.yellow(d.name)}] ${command}`);
          pipeWith(child.stdout, process.stdout, d.name)
          pipeWith(child.stderr, process.stderr, d.name);
        });
      })
      .value();

    Promise.all(promises).then(o => cb()).catch(e => cb(e));
  }).desc('run same build tasks in child projects.');
}
