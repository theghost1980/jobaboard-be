var mongoose = require('mongoose');
var PortfolioSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    story_line: String,
    description: String,
    languages:[{
        language: String,
        level: String,
    }],
    skills:[{
        skill: String,
        experience: String,
    }],
    education: [{
        country: String,
        degree: String,
        year: String,
    }],
    certifications: [
        {
            award: String,
            certified_on: String,
            year: String,
        },
    ],
    createdAt: String,
    updatedAt: String,
});
mongoose.model('Portfolio',PortfolioSchema);

module.exports = mongoose.model('Portfolio');