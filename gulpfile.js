var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
	livereload   = require('gulp-livereload'),
    gls          = require('gulp-live-server'),
    watch        = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer');

// @task sass
gulp.task('sass', function () {
  return gulp
    .src('app/stylesheets/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('public/stylesheets/'))
    .pipe(livereload());
});

gulp.task('js', function () {
  return gulp.src('app/js/**/*.js')
		  .pipe(gulp.dest('public/js'))
		  .pipe(livereload());
});

// @task serve
gulp.task('serve', function() {
    var server = gls.new('bin/www.js');
    server.start('./bin/www').then(function(result) {
        console.log('Server exited with result:', result);
        process.exit(result.code);
    });
    gulp.watch(['public/**/*.*'], function(file) {
        server.notify.apply(server, [file]);
    });
});

gulp.task('watch', ['js', 'sass'], function() {
	gulp.watch('app/js/**/*.js', ['js']);
	gulp.watch('app/stylesheets/**/*.scss', ['sass']);
});

gulp.task('default', [
  'play'
]);

gulp.task('play', [
  'serve', 'watch'
]);