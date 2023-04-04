import gulp from 'gulp';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';


(() => {
return gulp.src([
  './src/js/*.js',
  '!./src/js/utils.js'
])
  .pipe(uglify())
  .pipe(concat('index.js'))
  .pipe(gulp.dest('./static/'))
})();

(() => {
return gulp.src([
  './src/js/utils.js'
])
  .pipe(uglify())
  .pipe(gulp.dest('./static/'))
})();

