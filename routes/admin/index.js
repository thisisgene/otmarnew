var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Project  = mongoose.model( 'Project' );

/* GET home page. */
router.get('/', function(req, res, next) {
  Project.find(function(err, projects) {
    res.render('admin/index', {
      title: 'Admin',
      projects: projects
    });

  });
});



router.post('/create_project', function(req, res) {


  var name = req.body.name;
  console.log(name);

  new Project({
    name: name
  }).save(function(err, project) {
    if (!err) res.send(project._id);
  });

});

module.exports = router;
