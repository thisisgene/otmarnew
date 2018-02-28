var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Project  = mongoose.model( 'Project' );
var Image  = mongoose.model( 'Image' );


async function fetchProjects(query) {
  return await Project.find(query).sort('position');
}

async function getAllChildren(projectId, query) {
  return await Project.find({$and: [{parentId: projectId}, query]}).sort('position');
}

async function buildPath(projectLeafId, path = []) {
  let project = await Project.findById(projectLeafId);
  path.unshift(project);
  if (project.parentId != null && project.parentId != 'rootProject') {
    await buildPath(project.parentId, path);
  }
  return path;
}

function getLink(ancestorPath, leafProject) {

  let link = '/site/';
  for (let ancestorProject of ancestorPath) {
    link += ancestorProject.latName + '/';
  }
  link += leafProject.id;

  return link;
}

async function fetchProjectsWithLink(query) {
  let projects = await fetchProjects(query);
  let projectObj = [];
  for (let project of projects) {
    let path = await buildPath(project._id);
    let link = getLink(path, project);
    projectObj.push({
      name: project.name,
      path: link,
      update: project.update,
      ownUpdatePretty: project.ownUpdatePretty,
      showUpdate: project.showUpdate,
      setUpdate: project.setUpdate
    });
    console.log(project.name, link)
  }
  return projectObj;
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  let projects = await fetchProjectsWithLink({parentId: 'rootProject', deleted: false, visible: true});
  res.render('index', {
    title: 'Otmar Rychlik',
    projects: projects
  });
});

router.get('/site/*/:id', async function(req, res){
  let id = req.params.id;
  let project = await Project.findById(id);
  let children = await fetchProjectsWithLink({parentId: id, deleted: false, visible: true});
  console.log(children);
  let nextP = '';
  let prevP = '';

  let project_layout = project.layout;
  let nextQuery = {
    parentId: project.parentId,
    position: {$gt: project.position},
    deleted: false,
    visible: true,
    layout: project.layout
  };
  let prevQuery = {
    parentId: project.parentId,
    position: {$lt: project.position},
    deleted: false,
    visible: true,
    layout: project.layout
  };
  let nextProject = await Project.findOne(nextQuery).sort({_id: 1 });
  if (nextProject!=null) {
    nextP = nextProject.latName;
  }
  let prevProject = await Project.findOne(prevQuery).sort({_id: -1 });
  if (prevProject!=null) {
    prevP = prevProject.latName;
  }

  res.render('project/'+project_layout, {
    title: 'Otmar Rychlik | ' + project.name,
    project: project,
    children: children,
    nextProject: nextP,
    prevProject: prevP
  });
});
//
// router.get('/site/:name', async function(req, res) {
//   var name = req.params.name;
//   var nextP = '';
//   var prevP = '';
//
//   Project.findOne({'latName': name }, async function(err, project){
//     var project_layout = project.layout;
//     // project.getChildrenTree(function(error, children) {          //// TODO: get ancestor tree
//     //   console.log(children);
//     // });
//     var nextQuery = {
//       parentId: project.parentId,
//       _id: {$gt: project._id},
//       deleted: false,
//       visible: true,
//       layout: project.layout
//     };
//     var prevQuery = {
//       parentId: project.parentId,
//       _id: {$lt: project._id},
//       deleted: false,
//       visible: true,
//       layout: project.layout
//     };
//     let nextProject = await Project.findOne(nextQuery).sort({_id: 1 });
//     let nextP = nextProject.latName;
//     let prevProject = await Project.findOne(prevQuery).sort({_id: -1 });
//     let prevP = prevProject.latName;
//
//     res.render('project/'+project_layout, {
//       title: 'Otmar Rychlik | ' + project.name,
//       project: project,
//       nextProject: nextP,
//       prevProject: prevP
//     });
//
//
//   })
// });

router.get('/login', function(req, res) {
  res.render('login', {
    title: 'Log In'
  });
});

module.exports = router;


