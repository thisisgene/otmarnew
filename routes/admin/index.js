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
    name: name,
    deleted: false
  }).save(function(err, project) {
    if (!err) res.send(project._id);
  });
});

router.post('/create_sub_project', function(req, res) {
  var name = req.body.name;
  var id = req.body.parent;


  var newProject = new Project({
    name: name,
    deleted: false,
    hasParent: true,
    parentId: id

  });
  newProject.save();

  Project.findById(id, function(err, project) {
    if (err) console.log(err);
    else {

      // updateParent(project.parentId);
      console.log(project);
      project.children.push(newProject._id);
      project.hasChildren = true;
      project.save(function(err, project) {
        res.send('success');
      });

    }

  });

});

function updateParent(id) {
  Project.findById(id, function(err, project) {

  })
}

router.get('/delete/:id', function(req, res) {
  var id = req.params.id;
  Project.findById(id, function(err, project) {
    project.deleted = true;
    project.save(function(err, project) {
      res.redirect('/admin');
    });
  })
});

router.get('/project/:id', function(req, res, next) {
  Project.find(function(err, projects) {
    res.render('admin/index', {
      title: 'Admin',
      projects: projects,
      currentProjectId: req.params.id
    });

  });
});

module.exports = router;
