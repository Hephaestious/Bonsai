'use strict';

var gulp = require('gulp');
var electron = require('electron-connect').server.create();

gulp.task('run', function () {

  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('main.js', electron.restart);

  // Reload renderer process
  gulp.watch(['./angular/bund.js', 'index.html'], electron.reload);
});
