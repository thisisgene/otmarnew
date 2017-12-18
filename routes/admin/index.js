var express = require('express');
var router = express.Router();
var marked = require('marked');
var mongoose = require( 'mongoose' );
var Project  = mongoose.model( 'Project' );
var Image  = mongoose.model( 'Image' );
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });


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
  var parentId = req.body.parentId;


  Project.findById(parentId, function(err, project) {
    if (err) console.log(err);
    else {
      var newProject = new Project({
        name: name,
        deleted: false,
        hasParent: true,
        parentId: parentId,
        parentName: project.name

      });
      newProject.save();
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
    })

  })
});

router.post('/save_all', function(req, res) {
  var body = req.body;
  var id = body.id;
  var description = body.description;
  var descHtml = marked(description);
  var layout = body.layout;
  var msg = '';

  Project.findById(id, function(err, project) {
    project.descMU = description;
    project.descHtml = descHtml;
    project.layout = layout;
    if (body.namechanged) {
      project.name = body.name;
      msg = 'changed';
    }
    project.save(function(err) {
      if (err) res.send(err);
      else res.send(msg);
    })
  })
});

router.post('/upload', upload.single('file'), function(req, res) {
  var file = req.file;
  console.log(file);
  if ( !file.mimetype.startsWith( 'image/' ) ) {
    return res.status( 422 ).json( {
      error : 'Die Datei muss ein Bildformat sein.'
    } );
  }
  else {
    var id = req.body.project_id;
    Project.findById(id, function(err, project) {
      if (err) res.send(err);
      else {
        var image = new Image({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          fileSize: file.size
        });
        image.save();
        project.images.push(image);
        project.save(function(err, project) {
          res.send('success');
        });
      }
    })
  }
});

module.exports = router;
