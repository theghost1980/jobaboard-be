var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./User');
var Logs = require('./Logs');
var Job = require('./Job');
var jwt = require('jsonwebtoken');
var config = require('./config');
const time = new Date();

///////////////////////////////////////////////////////////////////////
//////Public routes for user
router.get('/getField', function(req, res){
    const query = req.headers['query'];
    const jsonFields = JSON.parse(query);
    if(config.testingData){ console.log('To find:', jsonFields)};
    if(!jsonFields || jsonFields === ""){
        if(config.testingData){console.log('Empty query from public users req');}
        return res.status(404).send({ status: 'failed', message: 'I cannot query emptiness.'});
    }else{
        User.findOne({ username: jsonFields.username },function(err,found){
            if(err){
                if(config.testingData){ console.log('Error getting field from user, public request.',err)};
                return res.status(500).send({ error: err });
            }
            if(config.testingData){ console.log('Found from public request on fields',found)};
            return res.status(200).send({ status: 'sucess', result: found});
        });
    }
})

//////Public routes for user
router.get('/getActiveJobs', function(req, res){
    const username = req.headers['username'];
    if(config.testingData){ console.log('To find:', username)};
    if(!username || username === ""){
        if(config.testingData){console.log('Empty query from public users req');}
        return res.status(404).send({ status: 'failed', message: 'I cannot query emptiness. PR.'});
    }else{
        Job.find({ username: username, active: true },function(err,found){
            if(err){
                if(config.testingData){ console.log('Error getting jobs from user, public request.',err)};
                return res.status(500).send({ error: err });
            }
            if(config.testingData){ console.log('Found from public request on Jobs',found)};
            return res.status(200).send({ status: 'sucess', result: found});
        });
    }
})
///////////////////////////////////////////////////////////////////////


module.exports = router;