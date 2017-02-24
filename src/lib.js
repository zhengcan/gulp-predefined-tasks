import pump from 'pump';
import gutil from 'gulp-util';
import babel from 'gulp-babel';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';

import { JS_FILES, CSS_FILES, LESS_FILES, IMAGE_FILES, FONT_FILES } from './constant';

export default (gulp, options) => {
  let { libDir } = options;

  gulp.task('build:lib', [
    'build:lib:js', 'build:lib:style', 'build:lib:resource'
  ]).desc('build project as library');

  gulp.task('build:lib:js', (cb) => {
    pump([
      gulp.src(JS_FILES),
      plumber(),
      sourcemaps.init(),
      babel({
        presets: ["es2015", "react", "stage-2"]
      }),
      sourcemaps.write(),
      gulp.dest(libDir),
    ], cb);
  });

  gulp.task('build:lib:style', [
    'build:lib:css', 'build:lib:less'
  ]);

  gulp.task('build:lib:css', (cb) => {
    pump([
      gulp.src(CSS_FILES),
      postcss([autoprefixer()]),
      gulp.dest(libDir),
    ], cb);
  });

  gulp.task('build:lib:less', (cb) => {
    pump([
      gulp.src(LESS_FILES),
      less(),
      postcss([autoprefixer()]),
      gulp.dest(libDir),
    ], cb);
  });

  gulp.task('build:lib:resource', [
    'build:lib:image', 'build:lib:font'
  ]);

  gulp.task('build:lib:image', (cb) => {
    pump([
      gulp.src(IMAGE_FILES),
      gulp.dest(libDir),
    ], cb);
  });

  gulp.task('build:lib:font', (cb) => {
    pump([
      gulp.src(FONT_FILES),
      gulp.dest(libDir),
    ], cb);
  });
}
