var mongoose = require('mongoose');
var CategorySchema = new mongoose.Schema({
    name: {
        type:String,
        unique: true,
    }, 
    title: String,
    subtitle: String,
    query: {
        type:String,
        unique: true,
    },
    sub_category: [String],
    image: String, 
    hideOnLoggin: Boolean, 
    link: Boolean,
    active: Boolean,
});
mongoose.model('Category', CategorySchema);
module.exports = mongoose.model('Category');