var mongoose = require('mongoose');
var OrderSchema = new mongoose.Schema({
    username_employer: String, //the ones who serves the order
    username_employee: String, //the ones who ask this gig/job
    status: { //"to Complete", "Completed", "Reported", "Cancelled by Employer", "Blocked by Admin", "On Review By System", "Force Terminus"
        type: String,
        default: "to Complete",
    },
    issue_reason: String,
    issue_note: String,
    note: String, //used for 'cancellation' or "anything else needed".
    nft_id: Number,
    nft_symbol: String,
    nft_amount: Number, //represent the amount of NFTs the user will give/get, depending on order type.
    nft_price_on_init: Number, //respresent the price when the order was emitted. In case we may want to allow users to change prices on their nft later on without affecting on going orders.
    job_id: String,
    job_title: String, //used to check if maybe the user placed the same order twice.
    days_to_complete: Number,
    category_job: String,
    sub_category: String,
    escrow_type: String, //could be 'system' or 'username'.
    review: String, //after status:Completed, the
    job_type: String, //as employee or employeer, reference of this job (optional maybe)
    sub_total: Number,
    extra_money: Number,
    total_amount: Number, //in case we add later on extra features or quantity.
    tx_id: String, //as the txId of this transference when successfull as paid.
    createdAt: Date,
    updatedAt: Date, //just accessed by system when cancelling or completion, etc.
    special_requirements: String, //if the employee needs more specifications.
});
mongoose.model('Order',OrderSchema);

module.exports = mongoose.model('Order');