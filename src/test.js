import pump from 'pump';
import mocha from 'gulp-spawn-mocha';

import { JS_FILES, CSS_FILES, LESS_FILES, IMAGE_FILES, FONT_FILES } from './constant';

export default (gulp, options) => {
  function executeMocha(watch) {
    return gulp
      .testSrc(JS_FILES, { read: false })
      .pipe(mocha({
        env: { 'NODE_ENV': 'test' },
        watchExtensions: 'jsx',
        require: 'ignore-styles',
        compilers: '.:babel-register',
        watch,
      }))
      .once('error', (resp) => {
        if (resp.code === 'ENOENT') {
          console.error('Please install mocha first.');
        } else {
          console.error(resp.message);
        }
      });
  }
  gulp.task('test', (cb) => {
    return executeMocha(false);
  }).desc('run all tests');

  gulp.task('test:watch', (cb) => {
    return executeMocha(true);
  }).desc('watch and run all tests');
}
