import gulp from 'gulp';
import concat from 'gulp-concat';
import autoPrefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';

(() => {
return gulp.src([
    './src/styles/*.css',
  ])
    .pipe(concat('index.css'))
    .pipe(cleanCSS())
    .pipe(autoPrefixer({
      cascade: false
    }))
    .pipe(gulp.dest('./static/'))
})();


