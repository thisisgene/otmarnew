var mongoose = require('mongoose');
var ProjectSchema = new mongoose.Schema({
  name: String,
  deleted: Boolean

}, { _id: true });

ProjectSchema.add({ subProjects: [ProjectSchema] });

var User = mongoose.model('Project', ProjectSchema);

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/rychlik', {useMongoClient: true});