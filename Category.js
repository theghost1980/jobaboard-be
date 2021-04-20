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
    thumb: String,
    active: Boolean,
});
mongoose.model('Category', CategorySchema);
module.exports = mongoose.model('Category');