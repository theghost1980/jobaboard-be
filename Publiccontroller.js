var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./User');
var Logs = require('./Logs');
var Job = require('./Job');
const Nft = require('./Nft');
var jwt = require('jsonwebtoken');
var config = require('./config');
const time = new Date();
//to handle publicc queries as the JABblockexplorer
const SSC = require('sscjs');
const ssc = new SSC(config.SSC_node);
const sscMain = new SSC(config.SSC_main);

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

//////Public routes for Jobs
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
router.get('/JobsQuery',function(req,res){
    const query = JSON.parse(req.headers['query']);
    const limit = Number(req.headers['limit']) || 0;
    const sortby = JSON.parse(req.headers['sortby']) || { createdAt: -1 };
    if(config.testingData){ console.log(`Public query on jobs ${new Date().toLocaleDateString()}`,query) };
    Job.find(query, function(err, jobs){
        if(err) {
            console.log('Error finding jobs',err);
            return res.status(500).send({ status: 'failed', message: err });
        }
        return res.status(200).send({ status: 'sucess', result: jobs});
    }).sort(sortby).limit(limit)
});
///////////////////////////////////////////////////////////////////////

////////Public routes for blocks on hive node main
////The tx for transfers always will live under the main NET
////We may choose bewteen: ssc for test node and sscMain for main.
// on sscMain:
// - tx money transfers
// on ssc:
// - nft created, actual nft, instances.
router.get('/tx', function(req, res){ //loop up for money transfers.
    //testing to look up a particular tx on the test SSC server
    const tx = req.headers['tx'];
    if(!tx){
        return res.status(404).send({ status: 'failed', message: 'No Tx id was provided. Funny guy!'});
    }
    console.log(`Public Looking into tx:${tx}`);
    sscMain.getTransactionInfo(tx, function(err, result){
        // if(result === null){ return res.status(200).send({ status: 'askAgain'})}
        if(err){
            if(config.testingData){console.log('Error fetching from RPC API hive.',err);}  
            return res.status(500).send({ result: 'error', error: err});
        }
        // if(config.testingData){console.log(result);}
        res.status(200).send(result);
    });
});
////////END Public routes for blocks on hive node

///////////Public routes for NFTs///////////
//get all token based on query, handling the query on headers.
router.get('/getNFTquery', function(req,res){
    const query = req.headers['query'];
    const limit = Number(req.headers['limit']);
    const sortby = JSON.parse(req.headers['sortby']);
    const jsonQuery = JSON.parse(query);
    if(!jsonQuery) {
        console.log('A null || public empty query has been made!');
        return res.status(404).send({ status: 'funny', message: "I cannot process that!"});
    }
    //TODO process the query check for nulls || "" and create teh newQuery.
    const newNode = {};
    Object.entries(jsonQuery).forEach(([key, val]) => {
        if(val !== null && val !== ""){
            return (newNode[key] = val);
        }
    });
    console.log('New public query to process on NFTs');
    console.log(newNode, `Limit:${limit}`);
    console.log('Sortby:',sortby);
    Nft.find(newNode,function(err,tokens){
        if(err){
            if(config.testingData){
                console.log('Error finding Nft',err);
            }
            return res.status(500).send({ error: 'Error searching for Nft', message: err});
        }
        return res.status(200).send({ status: 'sucess', result: tokens });
    }).limit(limit).sort(sortby.hasOwnProperty("null") ? null : sortby);
});

///get all instances on mongoDB based on query
router.get('/getNFTInstancesQuery', function(req,res){
    const query = req.headers['query'];
    const limit = Number(req.headers['limit']);
    const sortby = JSON.parse(req.headers['sortby']);
    const jsonQuery = JSON.parse(query);
    if(!jsonQuery) {
        console.log('A null || empty public query has been made!');
        return res.status(404).send({ status: 'funny', message: "I cannot process that!"});
    }
    //TODO process the query check for nulls || "" and create teh newQuery.
    const newNode = {};
    Object.entries(jsonQuery).forEach(([key, val]) => {
        if(val !== null && val !== ""){
            return (newNode[key] = val);
        }
    });
    console.log('New public query to process::::');
    console.log(newNode, `Limit:${limit}`);
    console.log('Sortby:',sortby);
    Nft_user.find(newNode,function(err,tokens){
        if(err){
            if(config.testingData){
                console.log('Error finding Nft on public query',err);
            }
            return res.status(500).send({ error: 'Error searching for Nft', message: err});
        }
        return res.status(200).send({ status: 'sucess', result: tokens });
    }).limit(limit).sort(sortby.hasOwnProperty("null") ? null : sortby);
});
////////////////////////////////////////////

module.exports = router;