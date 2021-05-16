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
    nft_instance_id: Number,
    price: Number,
    priceSymbol: String,
    fee: Number,
    nft_instances: [ //so we can handle i.e, buy of 4 instances with same priceSymbol or n definitions with same priceSymbol.
        { 
            symbol: String,
            nfts: [ Number ], //array of ids.
            price: Number,
            priceSymbol: String,
            fee: Number, 
        }
    ],
    nft_definitions: [
        {
            symbol: String,
            id: Number,
            price: Number,
            priceSymbol: Number,
        }
    ],
    price_total: Number, //total price on order.
    price_symbol: String, //registers the symbol to pay.
    tx_id: String, //as the txId of this transference when successfull as paid.
    ts_hive: Number, //the timestamp returned by chain. just in case we need it later on.
    createdAt: Date,
    updatedAt: Date,
});
mongoose.model('Order_Market',OrderMarketSchema);

module.exports = mongoose.model('Order_Market');