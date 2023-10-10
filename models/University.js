const mongoose = require('mongoose');
const universitySchema = new mongoose.Schema({
    university: {
        type: String,
        required: true
    },
    dateRegistered: {
        type: Date,
        default: new Date().toISOString().split('T')[0],
        required:true
    },
    changeStatus:{
        type:String,
        default: 'Active',
    }
    
});

const University = mongoose.model('University', universitySchema);

module.exports = University;