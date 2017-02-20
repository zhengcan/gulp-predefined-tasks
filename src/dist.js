import pump from 'pump';
import gutil from 'gulp-util';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cleanCSS from 'gulp-clean-css';
import imagemin from 'gulp-imagemin';
import rename from 'gulp-rename';

import { JS_FILES, CSS_FILES, LESS_FILES, IMAGE_FILES, FONT_FILES } from './constant';

export default (gulp, options) => {
  let { distDir } = options;

  gulp.task('build:dist', ['build:dist:js', 'build:dist:style', 'build:dist:resource']);

  gulp.task('build:dist:js', (cb) => {
    pump([
      gulp.src(JS_FILES),
      babel(),
      gulp.dest(distDir),
      uglify(),
      rename({ suffix: '.min' }),
      gulp.dest(distDir),
    ], cb);
  });

  gulp.task('build:dist:style', ['build:dist:css', 'build:dist:less']);

  gulp.task('build:dist:css', (cb) => {
    pump([
      gulp.src(CSS_FILES),
      postcss([autoprefixer()]),
      gulp.dest(distDir),
      cleanCSS({compatibility: 'ie8'}),
      rename({ suffix: '.min' }),
      gulp.dest(distDir),
    ], cb);
  });

  gulp.task('build:dist:less', (cb) => {
    pump([
      gulp.src(LESS_FILES),
      less(),
      postcss([autoprefixer()]),
      gulp.dest(distDir),
      cleanCSS({compatibility: 'ie8'}),
      rename({ suffix: '.min' }),
      gulp.dest(distDir),
    ], cb);
  });

  gulp.task('build:dist:resource', ['build:dist:image', 'build:dist:font']);

  gulp.task('build:dist:image', (cb) => {
    pump([
      gulp.src(IMAGE_FILES),
      imagemin(),
      gulp.dest(distDir),
    ], cb);
  });

  gulp.task('build:dist:font', (cb) => {
    pump([
      gulp.src(FONT_FILES),
      gulp.dest(distDir),
    ], cb);
  });
}
