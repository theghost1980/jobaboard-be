var mongoose = require('mongoose');
const config = require('./config');
// Some notes
// when the user send a creation of token:
// 1.   we find for symbol, if not exists locked the symbol, lwc & username.
//      if exists, return message to user as name taken, refresh nft names.
// 2.   after created success, change state lwc. Done.
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
    // locked_while_creating: { //this field will be set as soon as the user start the creation so we can be sure no one else take this symbol during the process. After finished will toogle.
    //     type: Boolean,
    //     default: true,
    // }, 
    symbol: String,
    name: String,
    orgName: String,
    productName: String,
    url: String,
    maxSupply: String, //but handled as a number
    authorizedIssuingAccounts: [String],
    issuer: String,
    supply: Number,
    circulatingSupply: Number,
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