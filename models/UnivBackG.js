const mongoose = require('mongoose');
const UnivBackGSchema = new mongoose.Schema({
    UnivAddTitle: {
        type: String,
        required: true
    },
    UnivEst: {
        type: String,
        required: true
    },
    UBackground: {
        type: String,
        required: true
    }
});

const UnivBackG = mongoose.model('UnivBackG', UnivBackGSchema);

module.exports = UnivBackG;