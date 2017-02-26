import pump from 'pump';
import gutil from 'gulp-util';

import { JS_FILES, CSS_FILES, LESS_FILES, IMAGE_FILES, FONT_FILES } from './constant';

export default (gulp, options) => {
  gulp.task('watch', [
    'watch:lib'
  ]).desc('watch and build project');

  gulp.task('build:watch', [
    'watch:lib'
  ]).desc('watch and build project (alias to watch)');

  gulp.task('watch:lib', (cb) => {
    gulp.watch(JS_FILES, ['build:lib:js']);
    gulp.watch(CSS_FILES, ['build:lib:css']);
    gulp.watch(LESS_FILES, ['build:lib:less']);
    gulp.watch(IMAGE_FILES, ['build:lib:image']);
    gulp.watch(FONT_FILES, ['build:lib:font']);
  }).desc('watch and build project as library');

  gulp.task('watch:lib:js', (cb) => {
    gulp.watch(JS_FILES, ['build:lib:js']);
  });

  gulp.task('watch:lib:style', (cb) => {
    gulp.watch(CSS_FILES, ['build:lib:css']);
    gulp.watch(LESS_FILES, ['build:lib:less']);
  });

  gulp.task('watch:lib:css', (cb) => {
    gulp.watch(CSS_FILES, ['build:lib:css']);
  });

  gulp.task('watch:lib:less', (cb) => {
    gulp.watch(LESS_FILES, ['build:lib:less']);
  });

  gulp.task('watch:lib:image', (cb) => {
    gulp.watch(IMAGE_FILES, ['build:lib:image']);
  });

  gulp.task('watch:lib:font', (cb) => {
    gulp.watch(FONT_FILES, ['build:lib:font']);
  });
}
