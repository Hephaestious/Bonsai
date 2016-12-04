'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var electron = require('electron-connect').server.create();
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');

function runApp() {
  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('main.js', electron.restart);

  // Reload renderer process
  gulp.watch(['./angular/bundle.js', 'index.html'], electron.reload);
}

gulp.task('build', function() {
  var b = browserify('./angular/app.js')
    .bundle()
    .pipe(source('./angular/app.js'))
    .pipe(buffer())
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./angular'));

  runApp();
})

gulp.task('run', function () {
  runApp();
});
