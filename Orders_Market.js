var mongoose = require('mongoose');
var OrderMarketSchema = new mongoose.Schema({
    username: String, //the ones who makes the order
    ref_order_id: String, //the id from the sell order if the current is buy, so we can re-use data.
    order_type: String, // as "buy" or "sell".
    status: { //"notFilled", "Filled", "Reported", "Cancelled", "Blocked by Admin", "On Review By System", "Force Terminus"
        type: String,
        default: "notFilled",
    },
    issue_reason: String, //just used as reported or admins.
    issue_note: String, //just used as reported or admins.
    note: String, ////just used as reported or admins.
    item_type: String, //"definition" or "instance"
    orderId: Number, //to be used just when order make on hive market, so we can cancel it.
    nft_id: Number,
    nft_symbol: String,
    nft_instance_id: Number,
    price: Number,
    priceSymbol: String,
    fee: Number,
    nft_instances: [ //To be used only in Buy multiple
        { 
            from_account: String,
            symbol: String,
            nfts: [ Number ], //array of ids of the instances.
            price: Number,
            priceSymbol: String,
            fee: Number, 
        }
    ],
    nft_definitions: [ //To be used only in Buy multiple
        {
            from_account: String,
            symbol: String,
            nfts: [ Number ], //array of ids of definitions.
            price: Number,
            priceSymbol: String,
            fee: Number, //this field could belong to JABfee definitions from .env.
        }
    ],
    price_total: Number, //total price on order.
    price_symbol: String, //registers the symbol to pay.
    fee_Total: Number,
    tx_id: String, //as the txId of this transference when successfull.
    ts_hive: Number, //the timestamp returned by chain. just in case we need it later on.
    createdAt: Date,
    updatedAt: Date,
});
mongoose.model('Order_Market',OrderMarketSchema);

module.exports = mongoose.model('Order_Market');