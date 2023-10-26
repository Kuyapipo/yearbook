const mongoose = require('mongoose');
const UnivBackGSchema = new mongoose.Schema({
    UnivAddTitle: {
        type: String,
        default:'Add some data'
    },
    UnivEst: {
        type: String,
        default:'Add some data'
    },
    addressB:{
        type: String,
        default:'Add some data'
    },
    UBackground: {
        type: String,
        default:'Add some data'
    }
});

const UnivBackG = mongoose.model('UnivBackG', UnivBackGSchema);

module.exports = UnivBackG;