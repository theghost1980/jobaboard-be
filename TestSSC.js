var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./User');
var Logs = require('./Logs');
var jwt = require('jsonwebtoken');
var config = require('./config');
const time = new Date();

const SSC = require('sscjs');
const ssc = new SSC(config.SSC_node);

//get all NFTs, with a query.
// may be: { issuer: acc } or a more complex query
// as { issuer: acc, "properties.isPremium.authorizedEditingAccounts": acc }
router.get('/allNFTs', function(req, res){
    // console.log(req.params);
    // if(checkId(req.params.id.toString())){
    ////////////
    //check for a valid token
    const token = req.headers['x-access-token'];
    const query = req.headers['query']; //format as JSON.stringify(query = {});
    // TODO: this parsing has to be inside try/catch and it will serve as another checks on data
    const _query = JSON.parse(query);
    
    if(config.testingData){ console.log(_query); }
    // console.log('Token', token);
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //test to make a query to the test node.
            ssc.find("nft", "nfts", _query, null, 0, [], (err, result) => {
                if(err){
                    if(config.testingData){console.log('Error fetching from RPC API hive.',err);}  
                    return res.status(500).send({ result: 'error', error: err});
                }
                if(config.testingData){console.log(result);}
                res.status(200).send(result);
            });
        }
    });
});

//get nft instances of a query
router.get('/allInstances', function(req, res){
    // console.log(req.params);
    // if(checkId(req.params.id.toString())){
    ////////////
    //check for a valid token
    const token = req.headers['x-access-token'];
    const nftSymbol = req.headers['nftsymbol'];
    const query = req.headers['query']; //format as JSON.stringify(query = {});
    // TODO: this parsing has to be inside try/catch and it will serve as another checks on data
    const _query = JSON.parse(query);
    const table = req.headers['table'];
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            if(config.testingData){
                console.log(`Requested instances,user:${decoded.usernameHive}`)
                console.log(_query);
                console.log(nftSymbol);
                console.log(table);
            }
            ssc.find("nft", `${nftSymbol}${table}`, _query, null, 0, [], (err, result) => {
                if(err){
                    if(config.testingData){console.log('Error fetching from RPC API hive.',err);}  
                    return res.status(500).send({ result: 'error', error: err});
                }
                if(config.testingData){console.log(result);}
                res.status(200).send(result);
            });
        }
    });
});

//get a token balance inside the RPC node
router.get('/getBalance', function(req, res){
    const token = req.headers['x-access-token'];
    const query = req.headers['query']; //format as JSON.stringify(query = {});
    // TODO: this parsing has to be inside try/catch and it will serve as another checks on data
    const _query = JSON.parse(query);
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            if(config.testingData){
                console.log(`Requested instances,user:${decoded.usernameHive}`)
                console.log(_query);
            }
            ssc.find("tokens", "balances", _query, null, 0, [], (err, result) => {
                if(err){
                    if(config.testingData){console.log('Error fetching from RPC API hive.',err);}  
                    return res.status(500).send({ result: 'error', error: err});
                }
                if(config.testingData){console.log(result);}
                res.status(200).send(result);
            });
        }
    });
});

module.exports = router;