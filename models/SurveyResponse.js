const mongoose = require('mongoose');

// Define the SurveyResponse schema
const surveyResponseSchema = new mongoose.Schema({
    surveyName: {
        type: String,
        required: true,
    },
    surveyAge: {
        type: Number,
        required: true,
    },
    surveyGender: {
        type: String,
        required: true,
    },
    surveyFeedback: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    surveyComments: {
        type: String,
    }
});

// Create a model using the schema
const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

// Export the model
module.exports = SurveyResponse;