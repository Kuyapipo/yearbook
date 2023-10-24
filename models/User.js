const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userType:{
        type: String,
        required: true
    }, 
    idnumber:{
        type: String,
        required: true
    }, 
    fullname:{
        type: String,
        required: true
    }, 
    iemail:{
        type: String,
        required: true
    }, 
    password :{
        type: String,
        required: true
    }, 
    password2 :{
        type: String,
        required: true
    },
    schoolType :{
        type: String,
        required: true
    },
    dateOfbirth :{
        type: Date,
        default: Date.now,
        required:true
    }, 
    graduationDate :{
        type: Date,
        default: Date.now,
        required:true
    }, 
    department :{
        type: String,
        required: true
    },
    courseType :{
        type: String,
        required: true
    },
    graduationYear :{
        type: String,
        required: true
    },
    fileDocu:{
        data: Buffer, 
        contentType: String, 
        originalName: String
    },
    addressInput: {
        type: String,
        default: 'N/A',
    },
    status: {
        type: String,
        default: 'Pending', // Set the default value to 'Pending'
    },
});
 
const User = mongoose.model('User',UserSchema);

module.exports = User;