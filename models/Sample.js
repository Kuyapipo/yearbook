const mongoose = require('mongoose');
const sampleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    fileDocu: {
        type: String,
        required: true
    }
});

const Sample = mongoose.model('Sample', sampleSchema);

module.exports = Sample;