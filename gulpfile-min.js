"use strict";var gulp=require("gulp"),browserSync=require("browser-sync"),nodemon=require("gulp-nodemon");gulp.task("default",["browser-sync"],function(){}),gulp.task("browser-sync",["nodemon"],function(){browserSync.init(null,{proxy:"http://localhost:5000",files:["public/**/*.*"],browser:"google chrome",port:7e3})}),gulp.task("nodemon",function(o){var r=!1;return nodemon({script:"app.js"}).on("start",function(){r||(o(),r=!0)})});