var mongoose = require('mongoose');
const config = require('./config'); //in case we may use it for later.

var ReviewSchema = new mongoose.Schema({
    username_reviewed: String, //the one who receive the review.
    username_reviewer: String, //the one who did the review.
    order_id: String,
    days_to_complete: Number,
    days_completed: Number, //use to compare if was faster or slower
    time_complexion: Date, //maybe to use only if the order is completed before days_to_complete
    job_id: String,
    job_title: String,
    category_job: String,
    stars: Number, //as the score the employer gives at complexion.
    stars_rated: { star: Number, rated: String },
    image_review: String, //if the employer needs to upload an image on work finished.
    comments: String,
    note: String, //maybe to use/view only by admins
    show_public: { // defined just by admins but awill affect general queries.
        type: Boolean,
        default: true,
    },
    createdAt: Date,
    updatedAt: Date,
});
mongoose.model('Review', ReviewSchema);

module.exports = mongoose.model('Review');