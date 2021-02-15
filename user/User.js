var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    registered: Date,
    hash: String,
    usernameHive: String,
});
mongoose.model('User',UserSchema);

module.exports = mongoose.model('User');