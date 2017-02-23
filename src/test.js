import pump from 'pump';
import mocha from 'gulp-mocha';

import { JS_FILES, CSS_FILES, LESS_FILES, IMAGE_FILES, FONT_FILES } from './constant';

export default (gulp, options) => {
  gulp.task('test', (cb) => {
    gulp
      .testSrc(JS_FILES, { read: false })
      .pipe(mocha({
        watchExtensions: 'jsx',
        compilers: '.:babel-register',
      }))
      .once('error', (resp) => {
        if (resp.code === 'ENOENT') {
          console.error('Please install mocha first.');
        } else {
          console.error(resp.message);
        }
      });
  }).desc('Run all tests');

  gulp.task('test:watch', (cb) => {
    gulp.watch(JS_FILES, ['test']);
  }).desc('Watch and run all tests');
}
