var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    gls          = require('gulp-live-server'),
    watch        = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer');

// @task sass
gulp.task('sass', function () {
  return gulp
    .src('app/scss/**/*.scss')
    .pipe(watch('app/scss/**/*.scss'))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('js', function () {
  return gulp.src('app/js/**/*.js')
		  .pipe(watch('app/js/**/*.js'))
		  .pipe(gulp.dest('public/js'));
});

// @task serve
gulp.task('serve', function() {
    var server = gls('app.js');
    server.start('./bin/www').then(function(result) {
        console.log('Server exited with result:', result);
        process.exit(result.code);
    });
    gulp.watch(['public/**/*.*'], function(file) {
        server.notify.apply(server, [file]);
    });
    gulp.watch('app.js', server.start);
});

gulp.task('default', [
  'play'
]);

gulp.task('play', [
  'serve',
  'js',
  'sass'
]);