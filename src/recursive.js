import _ from 'lodash';
import path from 'path';
import gutil from 'gulp-util';
import { exec } from 'child_process';
import fs from 'fs';

const THIS_PROJECT = 'gulp-predefined-tasks';

const TYPE_NORMAL = 'normal';
const TYPE_LINK = 'link';

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
  // Parse argv
  let { argv, packageJson } = options;

  // Execute gulp tasks recursively
  if (argv.recursive || argv.R) {
    let command;
    if (/^win/.test(process.platform)) {
      command = _.join(_.map(process.argv, arg => '"' + arg + '"'), ' ');
    } else {
      command = _.join(process.argv, ' ');
    }

    let promises = _({})
      .merge(_.map(packageJson.dependencies, (value, name) => { return { type: TYPE_NORMAL, name, value }; }))
      .merge(_.map(packageJson.linkDependencies, (value, name) => { return { type: TYPE_LINK, name, value }; }))
      .filter(d => _.startsWith(d.value, 'file:') || _.startsWith(d.value, 'link:'))
      .map(d => {
        let [protocol, relativePath] = _.split(d.value, ':');
        if (d.type === TYPE_NORMAL) {
          if (protocol === 'file') {
            d.absolutePath = path.join(process.cwd(), relativePath);
          } else {
            // Not support yet
          }
        } else { // type === TYPE_LINK
          let pathInNodeModules = path.join(process.cwd(), 'node_modules', d.name);
          let stat = fs.lstatSync(pathInNodeModules);
          if (stat.isSymbolicLink()) {
            // Use symbolic link
            d.absolutePath = pathInNodeModules;
          } else {
            // Find via value
            if (protocol === 'file') {
              d.absolutePath = path.join(process.cwd(), relativePath);
            } else { // protocol === 'link'
              console.warn(`No link for ${d.name}.`);
            }
          }
        }
        return d;
      })
      .filter(d => {
        if (!d.absolutePath) {
          return false;
        }
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

    Promise.all(promises).then(o => {}, e => {
      console.error(e);
    });
  }
}
