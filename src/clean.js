import del from 'del';

export default (gulp, options) => {
  gulp.task('clean', [
    'clean:lib', 'clean:dist'
  ]).desc('clean project output');

  gulp.task('clean:lib', (cb) => {
    return del([options.libDir])
  }).desc('clean project lib folder');

  gulp.task('clean:dist', (cb) => {
    return del([options.distDir])
  }).desc('clean project dist folder');
}
