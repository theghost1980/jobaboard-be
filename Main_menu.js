var mongoose = require('mongoose');
var MainMenuSchema = new mongoose.Schema({
    title: String, 
    inner_link: String, 
    hideOnLoggin: Boolean, 
    link: Boolean,
    active: Boolean,
});
mongoose.model('Main_Menu', MainMenuSchema);

module.exports = mongoose.model('Main_Menu');