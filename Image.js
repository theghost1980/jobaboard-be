var mongoose = require('mongoose');
//this schema defines the image bank
// used for now just to handle images used in the JAB hive blog. Later on we can use it as central images bank.
var ImageSchema = new mongoose.Schema({
    image: { //we make them uniques to avoid uploading many times the same image so the BE will thrown an error on upload.
        type:String,
        unique: true,
    }, 
    thumb: { //the system automatically will create a resized image on each upload
        type:String,
        unique: true,
    },
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
mongoose.model('Image', ImageSchema);
module.exports = mongoose.model('Image');