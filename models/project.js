var mongoose = require('mongoose');
var ProjectSchema = new mongoose.Schema({
  name: String

});
var User = mongoose.model('Project', ProjectSchema);

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/rychlik', {useMongoClient: true});
