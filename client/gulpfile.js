'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var electron = require('electron-connect').server.create();
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var less = require('gulp-less');
var gulpSequence = require('gulp-sequence');

function runApp() {
  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('main.js', electron.restart);

  // Reload renderer process
  gulp.watch(['./angular/bundle.js', 'index.html'], electron.reload);
}

gulp.task('build-js', function() {
  var b = browserify('./angular/app.js')
    .bundle()
    .pipe(source('./angular/app.js'))
    .pipe(buffer())
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./angular'));
});

gulp.task('build-less', function () {
  gulp.src('./assets/less/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('./assets/css'));
});

/*gulp.task('run', function () {
  runApp();
});*/

gulp.task('build', gulpSequence('build-js', 'build-less'));

// Build with atom's build-gulp package
gulp.task('default', function(){
  gulp.src('./assets/less/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('./assets/css'));
  var b = browserify('./angular/app.js')
    .bundle()
    .pipe(source('./angular/app.js'))
    .pipe(buffer())
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./angular'));
  runApp();
});
