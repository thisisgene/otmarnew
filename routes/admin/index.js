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
  return await Project.findById(id);
}

async function getAllChildren(projectId, query) {
  return await Project.find({$and: [{parentId: projectId}, query]}).sort('position');
}

async function buildTree(projects, query) {
  let tree = [];
  for (let project of projects) {
    console.log(query +": " + project.deleted);
    let hasChildren = false;
    let children = await getAllChildren(project._id, query);
    if (children.length > 0) {
      hasChildren = true;
      children = await buildTree(children, query)
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

async function getProjectTree(query1, query2) {
  let projects = await Project.find({$and: [query1, query2]}).sort('position');

  return await buildTree(projects, query2);
}

async function sortProjects(parentId, body) {
  let projects = await Project.find({parentId: parentId});
  let pos;
  for (let project of projects) {
    pos = body['position' + project._id];
    project.position = pos;
    if (!parentId.deleted && project.deleted) project.deleted = false;
    project.save();

  }
}

/* GET home page. */
router.get('/', async function(req, res, next) {

  let regTree = await getProjectTree({parentId:"rootProject"}, {deleted: false});
  let delTree = await getProjectTree({parentId:"rootProject"}, {});
  console.log("deltree: "+delTree);
  res.render('admin/index', {
    title: 'Admin',
    projects: regTree,
    delPros: delTree,
    user: req.session.user
  });

});


// Build Path for bread crumbs

async function buildPath(projectLeafId, path = []) {
  let project = await Project.findById(projectLeafId);
  path.unshift(project);
  if (project.parentId != null && project.parentId !== 'rootProject') {
    await buildPath(project.parentId, path);
  }
  return path;
}

router.get('/project/:id', async function(req, res, next) {
  const id = req.params.id;


  let regTree = await getProjectTree({parentId:"rootProject"}, {deleted: false});
  let delTree = await getProjectTree({parentId:"rootProject"}, {});
  let currentProject = await fetchProject(id);
  let ancestorPath = await buildPath(id);
  res.render('admin/index', {
    title: 'Admin',
    projects: regTree,
    delPros: delTree,
    currentProjectId: id,
    thisProject: currentProject,
    ancestors: ancestorPath,
    user: req.session.user
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


  let children = await getAllChildren(projectId, {});
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
    res.redirect('/admin');
  });
});


////////////////////////////////// REMOVE PROJECT PERMANENTLY //////// FIXME: Recursive headf...

async function removeAllDeletedProjects() {
  let projectsToRemove = await Project.find({deleted: true});
  for (let project of projectsToRemove) {
    project.remove();
  }
  return 'success';
}

router.get('/remove_project', async function(req, res) {
  let msg = await removeAllDeletedProjects();
  res.send(msg);
});

////////////////////////////////// Save menu folder toggle state

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
  let parentId = (body.listId!=='main-list' ? body.listId : 'rootProject');


  await changeParent(id, parentId);

  await sortProjects(parentId, body);



  res.send("success");

});

//////////////////////////////////////////////// IMAGE UPLOAD

async function checkIfCoverExists(project) {
  let images = project.images;
  if (images.length <= 0 || images === undefined) return true;
  else {
    for (image of images) {
      if (image.isCover && !image.isDeleted) {
        console.log('found');
        return false
      }
    }
    return true
  }
}

router.post('/upload', upload.single('file'), function(req, res) {
  var file = req.file;
  if ( !file.mimetype.startsWith( 'image/' ) ) {
    return res.status( 422 ).json( {
      error : 'Die Datei muss ein Bildformat sein. (.jpg, .png, ...)'
    } );
  }
  else {
    var id = req.body.project_id;
    let isCover = false;
    Project.findById(id, async function(err, project) {
      isCover = await checkIfCoverExists(project);
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
          isDeleted: false,
          isCover: isCover
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
