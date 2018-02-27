var mongoose = require('mongoose');


var ImageSchema = new mongoose.Schema({
  filename      : String,
  originalName  : String,
  name          : String,
  reference     : String,
  desc          : String,
  path          : String,
  truePath      : String,
  fileSize      : Number,
  isCover       : Boolean,
  isVisible     : Boolean,
  isDeleted     : Boolean
});

var ProjectSchema = new mongoose.Schema();
ProjectSchema.add({

  name            : String,
  title           : String,
  subtitle        : String,
  latName         : String,
  descMU          : String,
  descHtml        : String,
  infoMU          : String,
  infoHtml        : String,
  showUpdate      : Boolean,
  update          : String,
  setUpdate       : Boolean,
  ownUpdate       : String,
  ownUpdatePretty : String,
  deleted         : Boolean,
  visible         : Boolean,
  unfold          : Boolean,
  hasParent       : Boolean,
  parentId        : String,
  parentName      : String,
  layout          : String,
  subAsChapters   : Boolean,
  position        : String,
  images          : [ImageSchema]

});

// ProjectSchema.plugin(tree);

// ProjectSchema.add({ subProjects: [ProjectSchema] });

var Project = mongoose.model('Project', ProjectSchema);
var Image = mongoose.model('Image', ImageSchema);

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://admin:otmarDB_adm2018@localhost/rychlik', {useMongoClient: true});

// otmarDB_adm2018