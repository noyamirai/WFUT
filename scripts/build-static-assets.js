import gulp from 'gulp';

(() => {
  return gulp.src([
    './src/fonts/**/*.*',
  ])
    .pipe(gulp.dest('./static/'))
})();