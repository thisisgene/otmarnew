var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Project  = mongoose.model( 'Project' );
var Image  = mongoose.model( 'Image' );

/* GET home page. */
router.get('/', function(req, res, next) {
  Project.find().sort('position').exec(function(err, projects) {
    res.render('index', {
      title: 'Otmar Rychlik',
      projects: projects
    });
  });
});

router.get('/site/:name', function(req, res) {
  var name = req.params.name;
  var nextP = '';
  var prevP = '';

  Project.findOne({'latName': name }, function(err, project){
    var project_layout = project.layout;
    // project.getChildrenTree(function(error, children) {          //// TODO: get ancestor tree
    //   console.log(children);
    // });
    var nextQuery = {
      parentId: project.parentId,
      _id: {$gt: project._id},
      deleted: false,
      visible: true,
      layout: project.layout
    };
    var prevQuery = {
      parentId: project.parentId,
      _id: {$lt: project._id},
      deleted: false,
      visible: true,
      layout: project.layout
    };
    Project.findOne(nextQuery).sort({_id: 1 }).exec(function(err, docNext) {
      if (err) console.log(err);
      if (docNext) {
        nextP = docNext.latName;
      }
      console.log('next: ', nextP);

      Project.findOne(prevQuery).sort({_id: -1 }).exec(function(err, docPrev) {
        if (err) console.log(err);
        if (docPrev) var prevP = docPrev.latName;
        console.log(prevP);

        res.render('project/'+project_layout, {
          title: 'Otmar Rychlick | ' + project.name,
          project: project,
          nextProject: nextP,
          prevProject: prevP
        });
      });
    });


  })
});

router.get('/login', function(req, res) {
  res.render('login', {title: 'Log In'});
});

module.exports = router;


