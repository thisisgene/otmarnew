var mongoose = require('mongoose');
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
  images: Array

}, { _id: true });

var ImageSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  path: String,
  fileSize: Number
});

// ProjectSchema.add({ subProjects: [ProjectSchema] });

var Project = mongoose.model('Project', ProjectSchema);
var Image = mongoose.model('Image', ImageSchema);

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/rychlik', {useMongoClient: true});