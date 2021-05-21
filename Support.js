var mongoose = require('mongoose');
var SupportSchema = new mongoose.Schema({
    username: String,
    usertype: String, //as admin, user.
    ip_address: String,
    ticket_type: String, //as general-support, specific-support, bug, suggestion, idea-improvement.
    category_support: String,
    solved: {
        type: Boolean,
        default: false,
    },
    ref_id: String, //if needed the user may fill as tx_id or transaction id.
    issue_description: String,
    issue_note: String,
    images: [String], //as the image uploaded to cloudinary, if needed.
    createdAt: Date,
    updatedAt: Date,
});
mongoose.model('Support', SupportSchema);

module.exports = mongoose.model('Support');