var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    gls          = require('gulp-live-server'),
    autoprefixer = require('gulp-autoprefixer');

// @task sass
gulp.task('sass', function () {
  return gulp
    .src('app/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('public/stylesheets/'));
});

// @task serve
gulp.task('serve', function() {
    var server = gls('app.js');
    server.start().then(function(result) {
        console.log('Server exited with result:', result);
        process.exit(result.code);
    });
    gulp.watch(['public/**/*.css', 'public/**/*.html'], function(file) {
        server.notify.apply(server, [file]);
    });
    gulp.watch('app.js', server.start);
});

// @task watch
gulp.task('watch', function() {
  return gulp
    .watch(input, ['sass'])
});

gulp.task('default', [
  'sass'
]);

gulp.task('play', [
  'default',
  'serve',
  'watch',
]);