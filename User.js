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
        default: [],
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
    __v: { type: Number, select: false },
    createdAt: Date,
    updatedAt: Date,
    holding: {
        type: [String],
        default: [],
    }, //this i think is the best way to relate the instances each user has. i.e: AKA,TOK,COKE. Means this user has instances of those 3 symbol tokens.
    nfts: [{ //an array of objects. each object is one instance
        ntf_id: Number, 
        ntf_symbol: String, 
        nft_instance_id: Number,
        burned: {
            type: Boolean,
            default: false,
        }, 
        price: Number, //to be set/updated first on hive, then here. Ideally to handle this only on marketPlace.
        on_sale: {
            type: Boolean,
            default: false,
        },
        thumb: String, //dunno if I will use it but leave it here for later
    }],
});
mongoose.model('User',UserSchema);

module.exports = mongoose.model('User');