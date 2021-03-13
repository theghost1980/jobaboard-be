var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    type: String,
    title: String,
    createdAt: Date,
    content: String,
    opened: Boolean,
    username: String,
});
mongoose.model('Notifications',UserSchema);

module.exports = mongoose.model('Notifications');