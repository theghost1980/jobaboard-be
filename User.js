var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        index: true,
        required: true,
        unique: true,
    },
    banned: {
        type: Boolean,
        default: false,
    },
    ban_reason: String,
    following: { //The users this user is following INSIDE JAB. We do not handle or care about HIVE followers as that's a waste of time and data for JAB.
        type: Array,
    },
    fullname: String,
    bio: String,
    location: String,
    avatar: String,
    instagram_link: String,
    twitter_link: String,
    portfolio_link: String,
    soundcloud_link: String,
    email: String,
    pk: String,
    usertype: String,
    __v: { type: Number, select: false },
    createdAt: Date,
    updatedAt: Date,
});
mongoose.model('User',UserSchema);

module.exports = mongoose.model('User');