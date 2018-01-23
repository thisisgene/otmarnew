var express = require('express');
var router = express.Router();
var marked = require('marked');
var mongoose = require( 'mongoose' );
var Project  = mongoose.model( 'Project' );
var Image  = mongoose.model( 'Image' );
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });
var latinize = require('latinize');



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

  var latName = latinize(name).toLowerCase();

  new Project({
    name: name,
    latName: latName,
    deleted: false,
    visible: true,
    layout : 'layout_mnu'
  }).save(function(err, project) {
    if (!err) res.send(project._id);
  });
});

router.post('/create_sub_project', function(req, res) {
  var name = req.body.name;
  var parentId = req.body.parentId;
  var latName = latinize(name).toLowerCase();
  latName = latName.replace(/\s/g , "_");

  Project.findById(parentId, function(err, project) {
    if (err) console.log(err);
    else {
      var newProject = new Project({
        name: name,
        latName: latName,
        deleted: false,
        visible: true,
        hasParent: true,
        parentId: parentId,
        parentName: project.name,
        layout : 'layout_mnu'

      });
      newProject.save();
      // updateParent(project.parentId);
      console.log(project);
      project.children.push(newProject);
      project.childrenIds.push(newProject._id);
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

    if (project.hasParent) {
      Project.findById(project.parentId, function(err, parent) {
        console.log('parent: ', parent.name);
        var children = parent.children;
        for (var i=0; i < children.length; i++) {
          var child = children[i];
          console.log(child.name);
          if (child.id == project.id) {
            console.log('id gleich');
            child.deleted = true;
          }
        }
        parent.save();

      });
    }

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
  var latName = body.menuname;
  var visible = body.visible;
  var msg = '';

  Project.findById(id, function(err, project) {
    project.descMU = description;
    project.descHtml = descHtml;
    project.layout = layout;
    project.latName = latName;
    project.visible = visible;
    if (body.namechanged) {
      project.name = body.name;
      msg = 'changed';
    }

    if (project.hasParent) {
      Project.findById(project.parentId, function(err, parent) {
        console.log('parent: ', parent.name);
        var children = parent.children;
        for (var i=0; i < children.length; i++) {
          var child = children[i];
          console.log(child.name);
          if (child.id == project.id) {
            console.log('id gleich');
            child.descMU = description;
            child.descHtml = descHtml;
            child.layout = layout;
            child.latName = latName;
            child.visible = visible;        
          }
        }
        parent.save();

      });
    }

    project.save(function(err) {
      if (err) res.send(err);
      else res.send(msg);
    })
  })
});

router.post('/check_name', function(req, res) {
  var body  = req.body,
      name  = body.name,
      id    = body.id;

  Project.findById(id, function(err, project) {
    if (!err) {
      Project.findOne({'latName': name}, function(err, target) {
        // console.log(target.name, target._id, project._id);
        if (target && target._id != id){
          res.send('not_unique')
        }
        else if (err) {res.send(err)}
        else res.send('unique')
      } )
    }
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
          name: file.originalname,
          path: file.path,
          fileSize: file.size,
          isVisible: true,
          isDeleted: false
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

router.post('/update_image/:cat', function(req, res) {
  var body = req.body;
  var cat = req.params.cat;
  console.log(cat);
  Project.findById(body.proid, function(err, project, next) {
    var images = project.images;
    for (var i=0; i<images.length; i++) {
      if (images[i]._id == body.imgid) {
        switch (cat) {
          case 'cover':
            images[i].isCover = true;
            break;
          case 'visible':
            images[i].isVisible = body.vistatus;
            break;
          case 'delete':
            images[i].isDeleted = true;
        }
      }
      else {
        if (cat == 'cover') {images[i].isCover = false; }
      }
    }
    project.save(function(err, project) {
      res.send('success');
    });
  });
});

router.post('/edit_image', function(req, res) {
  var body = req.body;
  Project.findById(body.project_id, function(err, project) {
    var images = project.images;
    for (var i=0; i < images.length; i++) {
      if (images[i]._id == body.image_id) {
        var img = images[i];
        img.name = body.name;
        img.desc = body.desc;
      }
    }
    project.save(function(err, project) {
      res.send('success');
    });
  })
});

module.exports = router;
