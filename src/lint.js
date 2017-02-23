import pump from 'pump';
import eslint from 'gulp-eslint';

import { JS_FILES, CSS_FILES, LESS_FILES, IMAGE_FILES, FONT_FILES } from './constant';

export default (gulp, options) => {
  gulp.task('lint', (cb) => {
    pump([
      gulp.src(JS_FILES),
      eslint(),
      eslint.format(),
      eslint.failAfterError(),
    ], cb);
  }).desc('lint source code');

  gulp.task('lint:watch', (cb) => {
    gulp.watch(JS_FILES, ['lint']);
  }).desc('watch and lint source code');
}
