var express = require('express');
var router = express.Router();
var marked = require('marked');
var mongoose = require( 'mongoose' );
var Project  = mongoose.model( 'Project' );
var Image  = mongoose.model( 'Image' );
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });
var latinize = require('latinize');
var dateFormat = require('dateformat')

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

/* GET home page. */
router.get('/', function(req, res, next) {
  Project.find().sort('position').exec(function(err, projects) {
    res.render('admin/index', {
      title: 'Admin',
      projects: projects
    });

  });
});

// function getAncestors(id, ancestors) {
//   Project.findById(id, function(err, project) {
//     if (err) console.log(err);
//     else {
//       ancestors.push({
//         name: project.name,
//         latname: project.latName,
//         id: project._id
//       });
//       if (project.hasParent) {
//         getAncestors(project.parentId, ancestors)
//       }
//
//       else {
//         console.log(ancestors);
//         return ancestors;
//       }
//
//     }
//   })
// }

// GET Project
router.get('/project/:id', function(req, res, next) {
  var id = req.params.id;

  Project.find().sort('position').exec(function(err, projects) {
    // Project.findById(id, function(err, project) {
    //   if (project.hasParent) {
    //     // console.log(project.hasParent);
    //     var ancestors = getAncestors(project.parentId, []);
    //     console.log('ANCESTORS: ', ancestors);
    //   }
    //
    //
    // })
    res.render('admin/index', {
      title: 'Admin',
      projects: projects,
      currentProjectId: id


    })
  })
});

router.post('/create_project', function(req, res) {
  var name = req.body.name;
  name = name.trim();
  var latName = latinize(name).toLowerCase();
  latName = latName.replace(/\s/g , "_");
  Project.findOne({latName: latName}, function(err, doc) {
    if (doc) {
      var rndNr = Math.random().toString(36).substr(2, 5);
      latName = latName + "_" + rndNr.toString();

    }

    new Project({
      name    : name,
      title   : name,
      latName : latName,
      deleted : false,
      visible : true,
      layout  : 'layout_mnu'
    }).save(function(err, p) {
      if (err) console.log(err);
      if (!err) res.send(p.id);
    });

  });

});

function match_loop(list, toCompare) {
  for (var i=0; i<list.length; i++) {
    console.log(list[i].latName, toCompare, list[i].latName == toCompare);
    if (list[i].latName == toCompare) return true
  }
  return false
}

router.post('/create_sub_project', function(req, res) {
  var name = req.body.name;
  name = name.trim();
  var parentId = req.body.parentId;
  var latName = latinize(name).toLowerCase();
  latName = latName.replace(/\s/g , "_");

  Project.findById(parentId, function(err, project) {
    // console.log(project);
    if (err) console.log(err);
    else {
      Project.findOne({latName: latName}, function(err, doc) {
        if (err) console.log(err);
        if (doc) {
          var rndNr = Math.random().toString(36).substr(2, 5);
          latName = latName + "_" + rndNr.toString();

        }
        var ancestors = (project.ancestors ? project.ancestors : []);
        if (!match_loop(ancestors, project.latName)) ancestors.push({
          name: project.name,
          id: project._id,
          latName: project.latName
        }); // see if ancestor already in list (from a sibling)
        var newProject = new Project({
          name        : name,
          title       : name,
          latName     : latName,
          deleted     : false,
          visible     : true,
          hasParent   : true,
          parentId    : parentId,
          parentName  : project.name,
          ancestors   : ancestors,
          layout      : 'layout_mnu'

        });
        newProject.save(function(err, p) {
          if (err) res.send(err);
          else {
            project.children.push(newProject);
            project.childrenIds.push(newProject._id);
            project.hasChildren = true;
            project.unfold = true;
            project.save(function(err) {
              if (err) throw err;
              else res.send(p.id);
            });
          }

        });
        // updateParent(project.parentId);


      });

    }

  });

});


router.get('/delete/:id', function(req, res) {
  var id = req.params.id;
  Project.findById(id, function(err, project) {

    if (project.hasParent) {
      Project.findById(project.parentId, function(err, parent) {
        var children = parent.children;
        for (var i=0; i < children.length; i++) {
          var child = children[i];
          if (child.id == project.id) {
            // child.deleted = true;
            var index = children.indexOf(child);
            parent.children.splice(index, 1);
          }

        }
        if (parent.children.length <= 0) parent.hasChildren = false;
        parent.save();

      });
    }

    project.deleted = true;
    project.save(function(err, project) {
      res.redirect('/admin');
    });
  })
});


////////////////////////////////// REMOVE PROJECT PERMANENTLY

router.post('/remove_project', function(req, res) {
  console.log(req.body.id);
  Project.findById(req.body.id).remove(function(err) {
    if (err) console.log(err);
    else res.send('success');
  })
});

router.post('/togglefold', function(req, res){
  var body = req.body;
  Project.findById(body.id, function(err, project) {
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
    project.orderedList = orderedList;
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
            child.showUpdate = showUpdate;
            child.update = update;
            child.setUpdate = setUpdate;
            child.ownUpdate = ownUpdate;
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

  // Project.find({'ancestors.name': oldname}).each( function(err, doc) {   // TODO: UPDATE ANCESTORS FOR ALL CHILDREN
  //   if (err) console.log(err);
  //   else{
  //     if (body.namechanged) {
  //       if (doc.parentName == oldname) doc.parentName = name;
  //
  //       for (var j=0; j<doc.ancestors.length; j++) {
  //         var ancestor = doc.ancestors[j];
  //         console.log("ANCI: ", ancestor);
  //
  //         if (ancestor.name == oldname) {
  //           ancestor.name = name;
  //           // ancestor.latName = latName;
  //           console.log("ANCI new: ", ancestor);
  //           doc.save();  ////////////////////////////////////////////////// FIXME: SAVE DOC!!??
  //         }
  //
  //       }
  //       doc.save(function(err) {
  //         if (err) console.log(err);
  //         else console.log('doc changed')
  //       });
  //
  //     }
  //
  //     Project.findById(id, function(err, project) {
  //       project.title = title;
  //       project.descMU = description;
  //       project.descHtml = descHtml;
  //       project.layout = layout;
  //       project.latName = latName;
  //       project.visible = visible;
  //       if (body.namechanged) {
  //         project.name = body.name;
  //         msg = 'changed';
  //       }
  //
  //       if (project.hasParent) {
  //         Project.findById(project.parentId, function(err, parent) {
  //           console.log('parent: ', parent.name);
  //           var children = parent.children;
  //           for (var i=0; i < children.length; i++) {
  //             var child = children[i];
  //             console.log(child.name);
  //             if (child.id == project.id) {
  //               child.name = name;
  //               child.title = title;
  //               child.descMU = description;
  //               child.descHtml = descHtml;
  //               child.layout = layout;
  //               child.latName = latName;
  //               child.visible = visible;
  //             }
  //           }
  //           parent.save();
  //
  //         });
  //       }
  //
  //       project.save(function(err) {
  //         if (err) res.send(err);
  //         else res.send(msg);
  //       })
  //     })
  //   }
  //
  // });

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

router.post('/projectsort', function ( req, res, next) {
  Project.find().exec(function (err, projects){
    var pos;
    projects.forEach(function(project){

      pos = req.body['position' + project.id];

      project.position = pos;
      project.save();

    });
    res.send("success");
  });
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
