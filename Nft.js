var mongoose = require('mongoose');
const config = require('./config');
// Some notes
// I will handle for now this table as the main definitions that we get when we create a token
// The price here is the price to sell this definition inside JAB. Selling = transferOwnership.
// This tokens will appear as golden ones on user's token.
var NFTSchema = new mongoose.Schema({
    nft_id: { 
        type: Number,
        unique: true,
    },
    account: String, //actual owner of the token = nft = instance.
    image: {
        type: String,
        default: config.logoDefault,
    },
    thumb: {
        type: String,
        default: config.miniLogoDefault,
    },
    price: Number, //set by user for now NTF/HIVE(means hive as the token set in configuration on NFT creation token & fee)
    symbol: String,
    name: String,
    orgName: String,
    productName: String,
    url: String,
    maxSupply: String, //but handled as a number
    issuer: String,
    issued_On:{ //this field may help to identify if the token was created on JAB or somewhere else, as a future feature if a user uses another platform to create an nft, he may be allowed to use it on jab only if pays a fee.
        type: String,
        default:"JAB platform",
    },
    for_sale: {
        type: Boolean,
        default: false,
    },
    in_use: { //i think we may need this field as true, when in use in a job, escrow so user cannot edit price i.e
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