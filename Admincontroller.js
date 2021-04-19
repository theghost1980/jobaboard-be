var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const User = require('./User');
const Logs = require('./Logs');
const Category = require('./Category');
// TODO: add logs access withint admincontroller and remove it from
// logs- maybe?
// var Logs = require('../logs/Logs');
var jwt = require('jsonwebtoken');
var config = require('./config');
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

////////Web content section
/////handling the categories + sub cats
router.get('/getCats', function(req,res){
    const token = req.headers['x-access-token'];
    const jsonQuery = JSON.parse(req.headers['query']);
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //as soon as we decode we search to verify is an admin.
            User.findOne({ username: decoded.usernameHive }, function(err,admin){
                if(err){
                    if(config.testingData){console.log('Error searching for admin.',err)};
                    return res.status(500).send({ status: 'failed', message: err});
                }
                if(found.usertype != 'admin'){
                    if(config.testingData){ console.log('User not admin.',found)};
                    return res.status(404).send({ status: 'failed', message: 'User not an admin!'});
                }else{
                    const filter = jsonQuery.query === "all" ? {} : jsonQuery;
                    Category.find(filter, function(err,category){
                        if(err){
                            if(config.testingData){console.log('Error searching for categories.',err)};
                            return res.status(500).send({ status: 'failed', message: err});
                        }
                        return res.status(200).send({ status: 'sucess', result: category});
                    });
                }
            })
        }else{

        }
    });
});
////////END Web content section


module.exports = router;