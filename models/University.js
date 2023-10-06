const mongoose = require('mongoose');
const universitySchema = new mongoose.Schema({
    university: {
        type: String,
        required: true
    },
    dateRegistered: {
        type: Date,
        default: true
    }
});

const University = mongoose.model('University', universitySchema);

module.exports = University;