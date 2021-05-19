var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Notifications = require('./Notifications');
var jwt = require('jsonwebtoken');
var config = require('./config');
const time = new Date();

///////Important to handle cluodinary + multer
//declarations
//cloudinary CDN images
var cloudinary = require('cloudinary').v2;
//config
cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret,
});
/////////////
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if(config.testingData){ 
            (file) ? console.log('Destination:::::::File::::::',file) : console.log('No file from client');
        }
        callback(null, __dirname + '/uploads')
    },
    filename: function (req, file, callback) {
        if(config.testingData){ 
            (file) ? console.log('Filename:::::::File::::::',file) : console.log('No file from client');
        }
        callback(null, file.fieldname + '_' + Date.now() + "_" + file.originalname);
    }
});  
const upload = multer({ storage: storage }).single("file");

//////to delete the file after sending it to cloud
const fs = require('fs');
let resultHandler = function (err) {
    if (err) {
        console.log("unlink failed", err);
    } else {
        console.log("file deleted from temporary server storage");
    }
}
////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////

/////////////////////////
//Final routers for Notifications
//Get notifications by username
router.get('/:username', function(req, res){
    const token = req.headers['x-access-token'];
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            // console.log(decoded);
            Notifications.find({ username: decoded.usernameHive }, function (err, docs) {
                if(err) return res.status(500).send("There was a problem finding the user's notifications." + "\n" + err);
                if(!docs) return res.status(404).send({ message: "No notifications for this user" });
                res.status(200).send(docs);
                console.log(`Searched Notifications on DB. \n name:${decoded.usernameHive} \n Time:${time}`);
            }).sort({ createdAt: -1});
        }else{
            return res.status(500).send({ auth: false, message: 'Error authenticating token GET notifications.' });
        }
    });
});

///CRUD notis
router.post('/handleNotification', function(req,res){
    const token = req.headers['x-access-token'];
    const operation = req.headers['operation']; //as create, update, delete || markread.
    const noti_id = req.headers['noti_id']; //as create, update, delete.
    if(!operation) return res.status(404).send({ auth: false, message: 'No operation provided!' });
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            upload(req, res, function(err){
                if(operation === 'create'){
                    const pData = JSON.parse(req.body['data']);
                    if(config.testingData){ console.log(`About to handle ${operation} with data:`, pData)};
                    Notifications.create(pData, function(err, created){
                        if(err){
                            if(config.testingData){ console.log('Error creating noti.', err)};
                            return res.status(500).send({ status: 'failed', message: err });
                        }
                        return res.status(200).send({ status: 'sucess', message: `Notification Sent to ${created.username}`})
                    });
                }else if(operation === 'markread'){
                    if(config.testingData){ console.log(`About to handle ${operation} with noti_id:`, noti_id)};
                    Notifications.findByIdAndUpdate(noti_id, { opened: true }, { new: true }, function(err, readNoti){
                        if(err){
                            if(config.testingData){ console.log('Error setting noti to read.', err )};
                            return res.status(500).send({ status: 'failed', message: err });
                        }
                        return res.status(200).send({ status: 'sucess', message: 'Set as read', result: readNoti });
                    })
                }
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Error decoding token.' });
        }
    });
});
///END crud notis

module.exports = router;
