const mongoose = require('mongoose');
const facultySchema = new mongoose.Schema({
    addFUniversity: {
        type: String,
        required: true
    },
    addFaculty: {
        type: String,
        required: true
    },
    addFDepartment: {
        type: String,
        required: true
    },
    dateFRegistered: {
        type: Date,
        default: new Date().toISOString().split('T')[0],
        required:true
    },
    changeStatusF:{
        type:String,
        default: 'Pending',
    }
});

const AddF = mongoose.model('AddF', facultySchema);

module.exports = AddF;