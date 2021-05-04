var mongoose = require('mongoose');
var MainMenuSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
    }, 
    inner_link: String, 
    hideOnLoggin: Boolean, 
    link: Boolean,
    active: {
        type: Boolean,
        default: true,
    },
    icon_url: String,
    show_icon: {
        type: Boolean,
        default: false,
    },
    order: Number,
    createdAt: Date,
    updatedAt: Date,
});
mongoose.model('Main_Menu', MainMenuSchema);

module.exports = mongoose.model('Main_Menu');