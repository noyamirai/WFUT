import gulp from 'gulp';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';


(() => {
return gulp.src([
  './src/js/*.js',
])
  .pipe(uglify())
  .pipe(concat('index.js'))
  .pipe(gulp.dest('./static/'))
})();

