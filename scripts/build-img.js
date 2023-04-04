import gulp from 'gulp';

(() => {
  return gulp.src([
    './src/images/**/*.*',
  ])
    .pipe(gulp.dest('./static/images'))
})();