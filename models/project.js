var mongoose = require('mongoose');
var ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  deleted: Boolean,
  hasChildren: Boolean,
  children: Array,
  hasParent: Boolean,
  parentId: String,
  parentName: String

}, { _id: true });

// ProjectSchema.add({ subProjects: [ProjectSchema] });

var User = mongoose.model('Project', ProjectSchema);

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/rychlik', {useMongoClient: true});