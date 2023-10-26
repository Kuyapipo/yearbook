const mongoose = require('mongoose');
const departmentSchema = new mongoose.Schema({
    addDUniversity: {
        type: String,
        required: true
    },
    addDepartment: {
        type: String,
        required: true
    },
    dateDRegistered: {
        type: Date,
        default: new Date().toISOString().split('T')[0],
        required:true
    },
    changeStatusD:{
        type:String,
        default: 'Pending',
    }
});

const AddD = mongoose.model('AddD', departmentSchema);

module.exports = AddD;