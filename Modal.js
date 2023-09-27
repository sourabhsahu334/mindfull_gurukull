const mongoose = require('mongoose');

// Define the schema
const loadSchema = new mongoose.Schema({

    data: {
        type: Object, // Data will be stored as an object
        required: true, // Data is required
      },

      newstype:{
        type:String,
      }
});

const Allnews = mongoose.model('Allnews', loadSchema);


module.exports = Allnews;
