var mongoose = require('mongoose');
var FaqSchema = new mongoose.Schema({
    active: {
        type: Boolean,
        default: true,
    },
    category: String,
    sub_category: String,
    title: String,
    questions_list:[{
        question: String,
        answer: String,
        action_link_url: String, //as optional i.e "/support".
    }],
    images: [String], //as optional, if needed maybe to point an action or teach something.
    createdAt: Date,
    updatedAt: Date,
});
//later on we could add more fields, depending on needs. I.e: logginmethod as 'HS' or 'KCH'.
mongoose.model('Faq',FaqSchema);

module.exports = mongoose.model('Faq');