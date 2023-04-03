import gulp from 'gulp';

(() => {
  return gulp.src([
    './src/images/**/*.*',
    './src/fonts/**/*.*',
  ])
    .pipe(gulp.dest('./static/'))
})();