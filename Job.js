var mongoose = require('mongoose');
var JobSchema = new mongoose.Schema({
    username: {
        type: String,
        index: true,
        required: true,
    },
    category: String,
    sub_category: String,
    title: { //so we can search using id or title.
        type: String,
        required: true,
        unique: true,
    },
    description: String,
    images: [String], //as support if the job needs it.
    nft_symbol: String,
    paying_price: Number,
    escrow_type: {
        type: String,
        default: 'system',
    }, //may be 'system'(auto-feature), select_from_lists, none
    escrow_username: {
        type: String,
        default: 'none',
    },
    promoted: Boolean, //this may be a special feature if pay some fee to appear first in searches
    active: Boolean, //true: active, false: paused.
    verifyed_profiles_only: Boolean, 
    createdAt: Date,
    updatedAt: Date,
});
mongoose.model('Job',JobSchema);

module.exports = mongoose.model('Job');