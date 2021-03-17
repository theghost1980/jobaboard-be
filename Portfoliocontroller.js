var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Portfolio = require('./Portfolio');
var jwt = require('jsonwebtoken');
var config = require('./config');
const time = new Date();

//find a portfolio
router.get('/getMyPort', function(req, res){
    //check for a valid token
    var token = req.headers['x-access-token'];
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            // console.log(decoded);

            //search jobs under this username
            Portfolio.find({ username: decoded.usernameHive }, function (err, docs) {
                if(err) return res.status(500).send("There was a problem finding the user's portfolio." + "\n" + err);
                if(!docs || docs.length <= 0) return res.status(404).send({ message: "No portolio for this user" });
                res.status(200).send(docs);
                if(config.testingData){
                    console.log('Token', token);
                    console.log(`Searched Portfolio on DB. \n name:${decoded.usernameHive} \n Time:${time}`);
                    console.log('Portfolio Found:',docs);
                }
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Error authenticating token GET Portfolio.' });
        }
    });
});

////PUBLIC ROUTES....
// TODO
// TODO
// TODO
// I can think of:
// - see a profile without login in.
////END PUBLIC ROUTES....

//////////Update or create///////////
//find/Update a portfolio
router.post('/create', function(req, res){
    //check for a valid token
    var token = req.headers['x-access-token'];
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //search portfolio under this username
            Portfolio.find({ username: decoded.usernameHive }, function (err, docs) {
                if(err) return res.status(500).send("There was a problem finding the user's portfolio." + "\n" + err);
                if(!docs || docs.length <= 0) {
                    //means not founf so create it
                    // before adding let's test the data and see it
                    if(config.testingData){
                        console.log("To add:");
                        console.log(req.body);
                    }
                    Portfolio.create(req.body,
                        function(err, portfolio){
                            if(err){
                                console.log('Error trying to add new portolfio on DB!',err);
                                return res.status(500).send({message: 'Error trying to add portfolio', error: err});
                            }
                            if(portfolio){
                                res.status(200).send(portfolio);
                                if(config.testingData){
                                    console.log(`Created Portfolio on DB. \nname:${portfolio.usernameHive} \nId:${portfolio._id} \nTime:${time}`);
                                }
                            } 
                        }
                    );
                };
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Error authenticating token GET Portfolio.' });
        }
    });
});
/////////////////////////

//Route for Job
//Get jobs by username
// router.get('/:username', function(req, res){
//     //check for a valid token
//     var token = req.headers['x-access-token'];
//     if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
//     jwt.verify(token, config.secret, function(err, decoded){
//         if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
//         if(decoded){
//             // console.log(decoded);

//             //search jobs under this username
//             Job.find({ username: decoded.usernameHive }, function (err, docs) {
//                 if(err) return res.status(500).send("There was a problem finding the user's Jobs." + "\n" + err);
//                 if(!docs || docs.length <= 0) return res.status(404).send({ message: "No jobs for this user" });
//                 res.status(200).send(docs);
//                 if(config.testingData){
//                     console.log('Token', token);
//                     console.log(`Searched Jobs on DB. \n name:${decoded.usernameHive} \n Time:${time}`);
//                     console.log('Jobs Found:',docs);
//                 }
//             });
//         }else{
//             return res.status(500).send({ auth: false, message: 'Error authenticating token GET Jobs.' });
//         }
//     });
// });

module.exports = router;
