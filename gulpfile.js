'use strict';

const gulp        = require('gulp');
const sass        = require('gulp-sass');
const browserSync = require('browser-sync');
const reload      = browserSync.reload;
const nodemon     = require('gulp-nodemon');



gulp.task('nodemon', function (cb) {

  var started = false;

  return nodemon({
    script : './bin/www'
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
    files: ["views/*.pug", "views/admin/*.pug"],
    browser: "google chrome",
    port: 7000
  });
});

gulp.task('sass', function () {
  return gulp.src('./sass/main.scss')
    .pipe(sass({
      errLogToConsole : true,
      sourceComments : true,
    }).on('error', sass.logError))
    .pipe(gulp.dest('./public/stylesheets'))
    .pipe(reload({ stream : true }));
});

gulp.task('sass-admin', function () {
  return gulp.src('./sass/admin/main.scss')
    .pipe(sass({
      errLogToConsole : true,
      sourceComments : true,
    }).on('error', sass.logError))
    .pipe(gulp.dest('./public/admin/stylesheets'))
    .pipe(reload({ stream : true }));
});

gulp.task('watch', function () {
  gulp.watch('./sass/*/*.sass', ['sass']);
  gulp.watch('./sass/admin/*/*.sass', ['sass-admin']);
});

gulp.task('default', ['watch', 'sass', 'sass-admin', 'browser-sync']);