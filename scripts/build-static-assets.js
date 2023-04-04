import gulp from 'gulp';

(() => {
  return gulp.src([
    './src/fonts/**/*.*',
    './src/service-worker.js',
  ])
    .pipe(gulp.dest('./static/'))
})();