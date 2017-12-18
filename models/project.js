var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  path: String,
  fileSize: Number,
  isCover: Boolean
});

var ProjectSchema = new mongoose.Schema({
  name: String,
  descMU: String,
  descHtml: String,
  deleted: Boolean,
  hasChildren: Boolean,
  children: Array,
  hasParent: Boolean,
  parentId: String,
  parentName: String,
  layout: String,
  images: [ImageSchema]

}, { _id: true });

// ProjectSchema.add({ subProjects: [ProjectSchema] });

var Project = mongoose.model('Project', ProjectSchema);
var Image = mongoose.model('Image', ImageSchema);

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/rychlik', {useMongoClient: true});