var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function () {
  return gulp
    .src('app/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('watch', function() {
  return gulp
    .watch(input, ['sass'])
});

gulp.task('default', [
  'sass'
]);

gulp.task('play', [
  'default', 
  'watch'
]);