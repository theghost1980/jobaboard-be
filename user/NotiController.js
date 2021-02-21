var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Notifications = require('./Notifications');
var jwt = require('jsonwebtoken');
var config = require('../config');
const time = new Date();

//////////
//check if valid Id object first
// function checkId(id){
//     return (id.match(/^[0-9a-fA-F]{24}$/)) ? true : false;
// }
//end stric checks
//////////

/////////////////////////
//Final routers for Notifications
//Get notifications by username
router.get('/:username', function(req, res){
    //check for a valid token
    var token = req.headers['x-access-token'];
    console.log('Token', token);
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
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Error authenticating token GET notifications.' });
        }
    });
});

module.exports = router;
