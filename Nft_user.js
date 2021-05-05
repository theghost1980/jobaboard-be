var mongoose = require('mongoose');
var Nft_userSchema = new mongoose.Schema({
    username: String,
    ntf_id: Number, 
    ntf_symbol: String, 
    nft_instance_id: Number,
    burned: {
        type: Boolean,
        default: false,
    }, 
    price: { //to be set/updated first on hive, then here. Ideally to handle this only on marketPlace.
        type: Number,
        default: 0,
    }, 
    priceSymbol: { // defined by system or user, we will see later on.
        type: String,
        default: 'notSet',
    },
    on_sale: {
        type: Boolean,
        default: false,
    },
    createdAt: Date,
    updatedAt: Date,
});
mongoose.model('Nft_user',Nft_userSchema);

module.exports = mongoose.model('Nft_user');