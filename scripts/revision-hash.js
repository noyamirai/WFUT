import gulp from 'gulp';
import rev from 'gulp-rev';
import override from 'gulp-rev-css-url';
import {deleteAsync} from 'del';

(() => {
return gulp.src([
    './static/index.css',
    './static/index.js',
    '!./static/utils.js'
  ])
    .pipe(rev())
    .pipe(override())
    .pipe(gulp.dest(`./static/`))
    .pipe(rev.manifest('rev-manifest.json'))
    .pipe(gulp.dest(`./static/`))
    .on('end', async function() {
      await deleteAsync(['./static/index.css', './static/index.js']);
    });
})();
