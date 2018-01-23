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

router.get('/site/:name', function(req, res) {
  var name = req.params.name;
  Project.findOne({'latName': name }, function(err, project){
    var project_layout = project.layout;
    console.log(project.layout);

    res.render('project/'+project_layout, {
      title: 'Otmar Rychlick | ' + project.name,
      project: project
    });
  })
});

router.get('/login', function(req, res) {
  res.render('login', {title: 'Log In'});
});

module.exports = router;
