var mongoose=require("mongoose"),ProjectSchema=new mongoose.Schema({name:String,description:String,deleted:Boolean,hasChildren:Boolean,children:Array,hasParent:Boolean,parentId:String},{_id:!0}),User=mongoose.model("Project",ProjectSchema);mongoose.Promise=require("bluebird"),mongoose.connect("mongodb://localhost/rychlik",{useMongoClient:!0});