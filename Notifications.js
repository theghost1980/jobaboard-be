var mongoose = require('mongoose');
var NotiSchema = new mongoose.Schema({
    type: String,
    title: String,
    createdAt: Date,
    updatedAt: Date,
    content: String,
    opened: Boolean,
    username: String,
    user_can_delete:{
        type: Boolean,
        default: true,
    },
    made_by: String,
});
mongoose.model('Notifications', NotiSchema);

module.exports = mongoose.model('Notifications');