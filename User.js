var mongoose = require('mongoose');
// Notes:
// I will handle nfts as the instances the user has, in order to get more control.
// this instances will pass between owners as they get buy/sell and when burn occurs it will die on Hive but remain here as burned.
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
    following:{
        type: [String],
        default: ['jobaboard'],
    }, //The users this user is following INSIDE JAB. We do not handle or care about HIVE followers as that's a waste of time and data for JAB.
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
    settings: {
        bee_settings: {
            dm: {
                only_from_friends: {
                    type: Boolean,
                    default: false,
                },
                show_preview_always: {
                    type: Boolean,
                    default: false,
                },
            }
        },
    },
    __v: { type: Number, select: false },
    createdAt: Date,
    updatedAt: Date,
});
mongoose.model('User',UserSchema);

module.exports = mongoose.model('User');