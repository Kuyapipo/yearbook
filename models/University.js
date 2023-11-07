const mongoose = require('mongoose');
const universitySchema = new mongoose.Schema({
    addUniversity: {
        type: String,
        required: false
    },
    dateRegistered: {
        type: Date,
        default: new Date().toISOString().split('T')[0],
        required:true
    },
    changeStatus:{
        type:String,
        default: 'Pending',
    }
    
});

const University = mongoose.model('University', universitySchema);

module.exports = University;