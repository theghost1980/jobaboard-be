var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./User');
var Logs = require('./Logs');
var OpLogs = require('./OperationsLogs');
var jwt = require('jsonwebtoken');
var config = require('./config');
const time = new Date();

//get logs using a filter
router.get('/getLogs',function(req,res){
    const token = req.headers['x-access-token'];
    const filter = req.headers['filter'];
    if(!filter) return res.status(404),send({ status: 'failed', message: 'I cannot query no filter'});
    const parsedFilter = JSON.parse(filter);
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            Logs.find(parsedFilter,function(err,founds){
                if(err) return res.status(500).send({ status: 'failed', message: err});
                return res.status(200).send({ status: 'sucess', result: founds});
            });
        }else{
            return res.status(404).send({ auth: false, message: 'Failed to decode.' });
        }
    });
});

//get user's logs
router.get('/alllogs', function(req, res){
    const time = new Date();
    // TODO verify token present on headers
    var token = req.headers['x-access-token'];
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //if decoded properly, we get the username of the "admin". Then we check in DB if that user is really usertype = admin.
            User.findOne({ username: decoded.usernameHive }, function(err, user){
                if(err) return res.status(500).send("There was a problem finding the user -xx.");
                if(user){
                    //it exists at least. now check if his usertype === admin
                    if(user.usertype === "admin"){
                        //the user is an admin so we may process finding all the data he asked
                        //now we may search all users and find the result
                        Logs.find({}, function(err, logs){
                            if(err) return res.status(500).send('There was a problem finding the logs.');
                            if(config.testingData){
                                console.log('Hi there Admin!');
                                console.log('Admin looked Up all users logs in DB.', time);
                            };
                            res.status(200).send(logs);
                        });
                    }else{
                        //no admin so send error
                        if(config.testingData){
                            console.log('F.O you are not an admin! Go code.');
                        }
                        return res.status(500).send({ auth: false, message: 'Error authenticating "admin" user.' });
                    }
                }else{
                    //
                    return res.status(500).send({ auth: false, message: 'Error no user found on that credentials.' });
                }
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Error authenticating token GET logs.' });
        }
    });
});
///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
/////////////Add OP logs
///from now on we use the logs as main log handler and schema.
router.post('/addOp',function(req, res){
    const time = new Date();
    // TODO verify token present on headers
    var token = req.headers['x-access-token'];
    if(!token) return res.status(500).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            Logs.create(req.body,function(err, newLog){
                    if(err){
                        console.log('Error trying to add new Log on DB!',err);
                        return res.status(500).send({ status: 'failed', message: err });
                    }
                    if(logOP){ 
                        return res.status(200).send({ result: "sucess", result: `Log added. ${newLog._id}`});
                    }
                }
            );
        }else{
            return res.status(404).send({ status: 'failed', message: 'Failed to decode token.'});
        }
    });
})
/////////////END - Add OP logs
///////////////////////////////////////////////////////////////////////

// get a single user from DB
// router.get('/:id', function(req, res){
//     if(checkId(req.params.id.toString())){
//         User.findById(req.params.id, function(err, user){
//             if(err) return res.status(500).send("There was a problem finding the user." + "\n" + err);
//             if (!user) return res.status(404).send("No user found.");
//             res.status(200).send(user);
//             console.log(`Searched User on DB. \n name:${user.name} \n id:${user.id}`);
//         });
//     }else {
//         console.log("A wrong ID formatted query was trying to reach the server's DB");
//         return res.status(404).send("Id format is not as required. Please use correct one!");
//     }
// })

// deletes a user from DB
// router.delete('/:id', function(req, res){
//     if(checkId(req.params.id.toString())){
//         User.findByIdAndRemove(req.params.id, function(err, user){
//             if(err) return res.status(500).send("There was a problem deleting the user");
//             res.status(200).send("User " + user.name + " was deleted.");
//             console.log(`Deleted User on DB. \n name:${user.name} \n id:${user.id}`);
//         });
//     }else {
//         console.log("A wrong ID formatted query was trying to reach the server's DB");
//         return res.status(404).send("Id format is not as required. Please use correct one!");
//     }
// });

// updates a single user in DB
// router.put('/:id', function(req, res){
//     if(checkId(req.params.id.toString())){
//         User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, user){
//             if(err) return res.status(500).send("There was a problem updating the user.");
//             res.status(200).send(user);
//             console.log(`Updated User on DB. \n name:${user.name} \n id:${user.id}`);
//         });
//     }else {
//         console.log("A wrong ID formatted query was trying to reach the server's DB");
//         return res.status(404).send("Id format is not as required. Please use correct one!");
//     }
// });

module.exports = router;
