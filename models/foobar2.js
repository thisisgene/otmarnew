


async function deleteProject(projectId)  {

  let project = await getProjectById(projectId);

  project.isDeleted = true;
  await project.save();


  if (project.children.length > 0) {
    let children = await getChildrenForProject(projectId);
    for (var child of children) {
      await deleteProject(child);
    }

  }

}

async function getChildrenForProject(projectId) {
  // -> Query for all projects with parentId == projectId
  let children = await Project.find({parentId: projectId});
  return children;
}




async function buildPath(projectLeafId, path = []) {
  let project = await Project.findById(projectLeafId);
  path.unshift(project);
  if (project.parentId != null) {
    await buildPath(project.parentId, path);
  }
  return path;
}


function getLink(ancestorPath, leafProject) {

  let link = '';
  for (let ancestorProject of ancestorPath) {
    link += ancestorProject.latName + '/';
  }
  link += leafProject.latName + '/' + leafProject.id;

  return link;
}




function foobar2() {
  return new Promise().value(4);
}

async function foobar() {

  var x = new Promise().value(4);

  x.then(function(value) {
    print(value);
  });

  var value = await x;


}

