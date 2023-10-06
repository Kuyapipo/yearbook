const mongoose = require('mongoose');
const addUSchema = new mongoose.Schema({
    addU: {
        type: String,
        required: true
    }
});

const AddU = mongoose.model('AddU', addUSchema);

module.exports = AddU;