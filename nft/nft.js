var mongoose = require('mongoose');
var NFTSchema = new mongoose.Schema({
    nft_id: {
        type: Number,
        required: true,
        index: true,
        unique: true,
    },
    account: String,
    image: String,
    thumb: String,
    price: Number,
    symbol: String,
    fee: Number,
    note: String,
    for_sale: {
        type: Boolean,
        default: false,
    },
    burned: {
        type: Boolean,
        default: false,
    },
    createdAt: Date,
    updatedAt: Date,
});
mongoose.model('Nft', NFTSchema);

module.exports = mongoose.model('Nft');