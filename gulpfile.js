'use strict';

const gulp        = require('gulp');
const browserSync = require('browser-sync');
const reload      = browserSync.reload;
const nodemon     = require('gulp-nodemon');


gulp.task('default', ['browser-sync'], function () {
});

gulp.task('nodemon', function (cb) {

  var started = false;

  return nodemon({
    script : './bin/www',
    nodeArgs : ['--inspect']
  }).on('start', function () {
    if (!started) {
      cb();
      started = true;
    }
  });
});

gulp.task('browser-sync', ['nodemon'], function() {
  browserSync.init(null, {
    proxy: "http://localhost:3000",
    files: ["public/**/*.*"],
    browser: "google chrome",
    port: 7000
  });
});

gulp.task('watch', function () {
  gulp.watch('./public/**/*.*').on('change', reload);
});

gulp.task('default', ['watch', 'browser-sync']);