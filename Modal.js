const mongoose = require('mongoose');

// Define the schema
const loadSchema = new mongoose.Schema({

email:{
  type:String,
  required:true,
  unique:true
},
name:{
  type:String,
  required:true
},
phone:{
  type:String,
  required:true
},
city:{
  type:String,
  required:true
},
state:{
  type:String,
  required:true
},
gender:{
  type:String,
  required:true
},
how_did_you:{
  type:String,
  required:true,
},
role:{
  type:String,
  default:"user"
}
});

const Users = mongoose.model('Users', loadSchema);


module.exports = Users;
