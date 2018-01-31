var mongoose = require('mongoose');


var ImageSchema = new mongoose.Schema({
  filename      : String,
  originalName  : String,
  name          : String,
  desc          : String,
  path          : String,
  fileSize      : Number,
  isCover       : Boolean,
  isVisible     : Boolean,
  isDeleted     : Boolean
});

var ProjectSchema = new mongoose.Schema();
ProjectSchema.add({
  name        : String,
  title       : String,
  latName     : String,
  descMU      : String,
  descHtml    : String,
  deleted     : Boolean,
  visible     : Boolean,
  hasChildren : Boolean,
  unfold      : Boolean,
  childrenIds : Array,
  children    : [ProjectSchema],
  hasParent   : Boolean,
  parentId    : String,
  parentName  : String,
  ancestors   : Array,
  layout      : String,
  images      : [ImageSchema]

});

// ProjectSchema.plugin(tree);

// ProjectSchema.add({ subProjects: [ProjectSchema] });

var Project = mongoose.model('Project', ProjectSchema);
var Image = mongoose.model('Image', ImageSchema);

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/rychlik', {useMongoClient: true});