var mongoose = require('mongoose');
// Notes:
// I will handle nfts as the instances the user has, in order to get more control.
// this instances will pass between owners as they get buy/sell and when burn occurs it will die on Hive but remain here as burned.
var WishlistSchema = new mongoose.Schema({
    username: String,
    owner: String,
    record_active: Boolean, //so when user wants to delete his actual wishlist, we will handle this field as we keep the record for later.
    image: String,
    thumb: String, 
    item_type: String, //as instance || definition.
    added_by_system: { //when the user has not enough balance and select "Yes, add it to my wishlist".
        type: Boolean,
        default: false,
    }, 
    nft_symbol: String,
    nft_instance_id: Number,
    nft_definition_id: Number,
    price: Number,
    priceSymbol: Number,
    orderId: String,
    createdAt: Date,
    updatedAt: Date,
});
mongoose.model('Wishlist',WishlistSchema);

module.exports = mongoose.model('Wishlist');