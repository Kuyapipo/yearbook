const mongoose = require('mongoose');
const HireSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    jobDescription:{
        type: String,
        required: true
    },
    jobRequirements: {
        type: String,
        required: true
    },
    applicationInstructions: {
        type: String,
        required: true
    },
    contactName: {
        type: String,
        required: true
    },
    contactEmail:{
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    changeStatusH: {
        type: String,
        default: 'Active'
    }

});

const Hire = mongoose.model('Hire', HireSchema);

module.exports = Hire;