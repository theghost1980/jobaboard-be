var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('../User/User');
var Logs = require('../Logs/Logs');
// TODO: add logs access withint admincontroller and remove it from
// logs- maybe?
// var Logs = require('../logs/Logs');
var jwt = require('jsonwebtoken');
var config = require('../config');
const time = new Date();

// BAN USER
// ---> TODO: Ask for better logic, maybe just the admins can ban users and not admins.
router.post('/ban/:username', function(req, res){
    var token = req.headers['x-access-token'];
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            // console.log(decoded);
            // To apply more secufiry we could look up this user as admin....
            const data = req.body;
            console.log(data);
            // console.log(`User to be Banned: ${data.username}\n Reason: ${data.reason}`);

            User.findOneAndUpdate({ username: data.username }, { banned: true }, {new: true}, function(err, user){
                if(err) return res.status(500).send("There was a problem banning the user.");
                //user banned so create log
                //create log
                // -----> TODO search this Admin on DB and bring his data.
                Logs.create({
                    username: decoded.username,
                    usertype: 'admin', 
                    createdAt: time,
                    ipaddress: req.ip,
                    event: `Banning ${data.username}`,
                    reason: data.reason,
                    },
                    function(err, log){
                        if(err){console.log('Error trying to add new Log on DB!',err)}
                        if(log){ 
                            console.log(`logID:${log.id}`);
                        } 
                    }
                );
                res.status(200).send(user);
                console.log(`Updated User on DB. \n username:${user.username} \n time:${time}\nNew Status: Banned!`);
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Error authenticating token GET user.' });
        }
    });
})
/////////////////////////


module.exports = router;