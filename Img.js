var mongoose = require('mongoose');
//this schema defines the image bank
// used for now just to handle images used in the JAB hive blog. Later on we can use it as central images bank.
var ImgSchema = new mongoose.Schema({
    image: String, 
    thumb: String,
    title: String, //optional if needed for later.
    relatedTo: [String], //optional to define a bit more than tags if needed.
    tags: [String],
    active: {
        type: Boolean,
        default: true,
    },
    createdAt: Date,
    updateAt: Date, //for now not in use maybe later.
});
mongoose.model('Img', ImgSchema);
module.exports = mongoose.model('Img');