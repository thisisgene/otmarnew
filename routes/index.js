var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Project  = mongoose.model( 'Project' );
var Image  = mongoose.model( 'Image' );

/* GET home page. */
router.get('/', function(req, res, next) {
  Project.find(function(err, projects) {
    res.render('index', {
      title: 'Otmar Rychlik',
      projects: projects
    });


  });
});

router.get('/login', function(req, res) {
  res.render('login', {title: 'Log In'});
});

module.exports = router;
