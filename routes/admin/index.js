const express = require('express');
const router = express.Router();
const marked = require('marked');
const mongoose = require( 'mongoose' );
const Project  = mongoose.model( 'Project' );
const Image  = mongoose.model( 'Image' );
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const slug = require('slug');
const dateFormat = require('dateformat');


dateFormat.i18n = {
  dayNames: [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ],
  monthNames: [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
    'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ],
  timeNames: [
    'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
  ]
};

async function fetchProject(id) {
  let project = await Project.findById(id);
  return project;
}

async function getAllChildren(projectId) {
  let children = await Project.find({parentId: projectId}).sort('position');
  return children;
}

async function buildTree(projects) {
  let tree = [];
  for (let project of projects) {
    let hasChildren = false;
    let children = await getAllChildren(project._id);
    if (children.length > 0) {
      hasChildren = true;
      children = await buildTree(children)
    }
    let data = {
      name : project.name,
      latName: project.latName,
      id: project._id,
      hasChildren: hasChildren,
      children: children,
      unfold: project.unfold,
      position: project.position,
      deleted: project.deleted
    };
    tree.push(data);

  }
  return tree;
}


/* GET home page. */
router.get('/', function(req, res, next) {
  Project.find({parentId:"rootProject"}).sort('position').exec(async function(err, projects) {
    let tree = await buildTree(projects);
    res.render('admin/index', {
      title: 'Admin',
      projects: tree,
      user: req.session.user
    });
  });
});


// GET Project

async function buildPath(projectLeafId, path = []) {
  console.log(projectLeafId);
  let project = await Project.findById(projectLeafId);
  path.unshift(project);
  if (project.parentId != null && project.parentId !== 'rootProject') {
    await buildPath(project.parentId, path);
  }
  return path;
}

router.get('/project/:id', function(req, res, next) {
  const id = req.params.id;

  Project.find({parentId:"rootProject"}).sort('position').exec(async function(err, projects) {
    let tree = await buildTree(projects);
    let ancestorPath = await buildPath(id);
    let currentProject = await fetchProject(id);
    res.render('admin/index', {
      title: 'Admin',
      projects: tree,
      currentProjectId: id,
      thisProject: currentProject,        ////// <-- FIXME: Not sent to client??
      ancestors: ancestorPath,
      user: req.session.user
    }, console.log(currentProject.name));
  });
});

//////////////////////////////////// CREATE PROJECT

router.post('/create_project', function(req, res) {
  const body = req.body;
  let name = body.name;
  name = name.trim();
  let latName = slug(name);
  let parentId = body.parentId;

  if (parentId==undefined) parentId = 'rootProject';

  new Project({
    name    : name,
    title   : name,
    latName : latName,
    parentId: parentId,
    deleted : false,
    visible : true,
    layout  : 'layout_mnu'
  }).save(function(err, p) {
    if (err) console.log(err);
    if (!err) res.send(p.id);
  });

});

function match_loop(list, toCompare) {
  for (var i=0; i<list.length; i++) {
    console.log(list[i].latName, toCompare, list[i].latName == toCompare);
    if (list[i].latName == toCompare) return true
  }
  return false
}

//////////////////////////////// DELETE PROJECTS

async function deleteProject(projectId)  {

  let project = await fetchProject(projectId);

  project.deleted = true;
  await project.save();


  let children = await getAllChildren(projectId);
  if (children.length > 0) {
    for (var child of children) {
      await deleteProject(child._id);
    }

  }
  return 'success'
}

router.get('/delete/:id', function(req, res) {
  var id = req.params.id;
  deleteProject(id).then(function(){
    res.redirect('back');
  });
});


////////////////////////////////// REMOVE PROJECT PERMANENTLY //////// FIXME: Recursive headf...

removeProject = function(p) {
  if (p.hasChildren) {
    for (var i=0; i<p.children.length; i++) {
      var child = p.children[i];
      removeProject(child);
    }
  }
  p.remove();

};

router.post('/remove_project', function(req, res) {
  console.log(req.body.id);
  Project.findById(req.body.id, function(err, project) {
    if (err) console.log(err);
    else {
      removeProject(project);
    }
  })
});


router.post('/togglefold', function(req, res){
  const body = req.body;
  Project.findById(body.id, function(err, project) {
    console.log(project);
    project.unfold = body.unfold;
    project.save(function(err){
      if (!err) {
        res.send('success');
      }
    })
  })
});

////////////////////////////////// SAVE ALL

router.post('/save_all', function(req, res) {
  var body = req.body;
  var id = body.id;
  var name;
  var title = body.title;
  var subtitle = body.subtitle;
  var oldname = body.oldname;
  var description = body.description;
  var descHtml = marked(description);
  var info = body.info;
  var infoHtml = marked(info);
  var layout = body.layout;
  var subAsChapters = body.subAsChapters;
  var orderedList = body.orderedList;
  var showUpdate = body.showUpdate;
  var setUpdate = body.setUpdate;
  var ownUpdate = body.ownUpdate;
  var latName = body.menuname;
  var visible = body.visible;
  var msg = '';
  var ObjectId = 'ObjectId("'+id+'")';

  var now = new Date().now;
  var update = dateFormat(now, 'd. mmmm yyyy');
  var ownUpdatePretty = dateFormat(ownUpdate, 'd. mmmm yyyy');
  console.log(update, ownUpdate);
  Project.findById(id, function(err, project) {
    project.title = title;
    project.subtitle = subtitle;
    project.descMU = description;
    project.descHtml = descHtml;
    project.infoMU = info;
    project.infoHtml = infoHtml;
    project.layout = layout;
    project.subAsChapters = subAsChapters;
    project.showUpdate = showUpdate;
    project.update = update;
    project.setUpdate = setUpdate;
    project.ownUpdate = ownUpdate;
    project.ownUpdatePretty = ownUpdatePretty;
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
          console.log('childname: ', child.name);
          if (child.id == project.id) {
            if (body.namechanged) child.name = body.name;
            child.title = title;
            child.descMU = description;
            child.descHtml = descHtml;
            child.layout = layout;
            child.subAsChapters = subAsChapters;
            child.showUpdate = showUpdate;
            child.update = update;
            child.setUpdate = setUpdate;
            child.ownUpdate = ownUpdate;
            child.ownUpdatePretty = ownUpdatePretty;
            child.latName = latName;
            child.visible = visible;
            console.log('adfsghfjghdf')
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
        if (target && target._id != id){
          res.send('not_unique')
        }
        else if (err) {res.send(err)}
        else res.send('unique')
      } )
    }
  })
});

//////////////////////////////////////////////// SORT PROJECTS

async function changeParent(id, parent) {
  let thisProject = await Project.findById(id);

  thisProject.parentId = parent;
  console.log(thisProject.parentId);
  thisProject.save();
  return thisProject;
}

router.post('/projectsort', async function ( req, res, next) {
  let body = req.body;
  let id = body.thisId;
  let query;
  let parent = (body.listId!=='main-list' ? body.listId : 'rootProject');


  await changeParent(id, parent);

  let projects = await Project.find({parentId: parent});
  let pos;
  for (let project of projects) {
    pos = body['position' + project._id];
    project.position = pos;
    if (!parent.deleted && project.deleted) project.deleted = false;
    project.save();

  }

    res.send("success");

});

//////////////////////////////////////////////// IMAGE UPLOAD

router.post('/upload', upload.single('file'), function(req, res) {
  var file = req.file;
  if ( !file.mimetype.startsWith( 'image/' ) ) {
    return res.status( 422 ).json( {
      error : 'Die Datei muss ein Bildformat sein. (.jpg, .png, ...)'
    } );
  }
  else {
    var id = req.body.project_id;
    Project.findById(id, function(err, project) {
      if (err) res.send(err);
      else {
        var oName = file.originalname;
        var truePath = file.path.substring(6);
        console.log(file.path, truePath);
        var shortname = oName.substr(0, oName.lastIndexOf("."));
        var image = new Image({
          filename: file.filename,
          originalName: file.originalname,
          name: shortname,
          reference: shortname,
          path: file.path,
          truePath: truePath,
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
        img.reference = body.reference;
        img.desc = body.desc;
      }
    }
    project.save(function(err, project) {
      res.send('success');
    });
  })
});

module.exports = router;
