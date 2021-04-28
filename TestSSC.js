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
const axios = require('axios');
const SSC = require('sscjs');
const ssc = new SSC(config.SSC_node);
//dhive to test the broadcast of a custom json
const dhive = require("@hiveio/dhive");
const client = new dhive.Client([ "https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network","https://hived.privex.io/"]);
const activeKey = dhive.PrivateKey.fromString(config.active_key);

// TODO very important:
// fix the vulnerability of axios on sscjs

//get all NFTs, with a query.
// may be: { issuer: acc } or a more complex query
// as { issuer: acc, "properties.isPremium.authorizedEditingAccounts": acc }
router.get('/allNFTs', function(req, res){
    // console.log(req);
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
            ssc.find("nft", "nfts", _query, null, 0, [{ index: "symbol", descending: false }], (err, result) => {
                if(result === null){ return res.status(200).send({ status: 'askAgain'})}
                if(err){
                    if(config.testingData){console.log('Error fetching from RPC API hive.',err);}  
                    return res.status(500).send({ result: 'error', error: err});
                }
                // if(config.testingData){console.log(result);}
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
            // if(config.testingData){
            //     console.log(`Requested instances,user:${decoded.usernameHive}`)
            //     console.log(_query);
            //     console.log(nftSymbol);
            //     console.log(table);
            // }
            ssc.find("nft", `${nftSymbol}${table}`, _query, null, 0, [], (err, result) => {
                if(err){
                    // if(config.testingData){console.log('Error fetching from RPC API hive.',err);}  
                    return res.status(500).send({ result: 'error', error: err});
                }
                // if(config.testingData){console.log(result);}
                res.status(200).send(result);
            });
        }
    });
});

//to handle tx
router.get('/tx', function(req, res){
    //testing to look up a particular tx on the test SSC server
    const tx = req.headers['tx'];
    const token = req.headers['x-access-token'];

    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            console.log(`Look into tx:${tx}`);
            console.log(`From:${decoded.usernameHive}`);
            ssc.getTransactionInfo(tx, function(err, result){
                if(result === null){ return res.status(200).send({ status: 'askAgain'})}
                if(err){
                    if(config.testingData){console.log('Error fetching from RPC API hive.',err);}  
                    return res.status(500).send({ result: 'error', error: err});
                }
                // if(config.testingData){console.log(result);}
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
            // if(config.testingData){
            //     console.log(`Requested instances,user:${decoded.usernameHive}`)
            //     console.log(_query);
            // }
            ssc.find("tokens", "balances", _query, null, 0, [], (err, result) => {
                if(err){
                    // if(config.testingData){console.log('Error fetching from RPC API hive.',err);}  
                    return res.status(500).send({ result: 'error', error: err});
                }
                // if(config.testingData){console.log(result);}
                res.status(200).send(result);
            });
        }
    });
});

//the next route must return the token if created
router.get('/findNFT', function(req, res){
    // console.log(req);
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
            ssc.find("nft", "nfts", _query, null, 0, [{ index: "symbol", descending: false }], (err, result) => {
                if(err){
                    if(config.testingData){console.log('Error fetching from RPC API hive.',err);}  
                    return res.status(500).send({ result: 'error', error: err});
                }
                // if(config.testingData){console.log(result);}
                res.status(200).send(result);
            });
        }
    });
});

///////New routes to handle the instantiation to do after a successfull order was made
router.post('/castNfts', function(req,res){
    if(config.testingData){ console.log(req.headers)};
    const token = req.headers['x-access-token'];
    const toprocess = req.headers['toprocess']; //query stringified as { from: '', to: '', nft_id: 0, symbol: '', amount: 0, order_id: ''}
    if(!toprocess) return res.status(404).send({ status: 'failed', message: 'No toProcess query provided!' });
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(404).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            const pToprocess = JSON.parse(toprocess);
            if(config.testingData){ console.log('About to process',pToprocess)};
            const feeSymbol = "BEE";
            const arrayJson = []; 
            for(let i = 0; i < pToprocess.amount ; i++){
                const payload = {
                    "fromType": "user",
                    "symbol": String(pToprocess.symbol),
                    "to": pToprocess.to,
                    "feeSymbol": feeSymbol,
                }
                arrayJson.push(payload);
            }
            const json = {
                "contractName": "nft",
                "contractAction": "issueMultiple",
                "contractPayload": {
                    "instances": [...arrayJson]
                },
            };
            // TODO: after beta/tests we move the .env var
            // ssc-testNettheghost1980 from the test node to the main hive.
            // and add to .env var
            const data = {
                id: 'ssc-testNettheghost1980',
                json: JSON.stringify(json),
                required_auths: ['jobaboard'],
                required_posting_auths: [],
            };
            if(config.testingData){
                console.log('Ready to send:',data);
            }
            client.broadcast.json(data, activeKey) //broadcast the instantation
            .then( result => {
                //testing just to add to holdings the new symbol on this user
                User.findOneAndUpdate( { username: pToprocess.to }, { $push: { holding: pToprocess.symbol } }, { new: true }, function(err, updated){
                    if(err){
                        console.log('Error on mongoDB field update.',err);
                        return res.status(500).send({ status: 'error', error: err});
                    }
                    console.log('Updated as:',updated);
                    return res.status(200).send({ status: 'sucess', updated: updated, result: result});
                });
            }).catch(error => {
                console.log('Error while instantiation.',error);
                return res.status(500).send({ status: 'failed', message: error});
            });
        }else{
            return res.status(404).send({ auth: false, message: 'Failed to decode user!!!.'});
        }
    });
});
////////////////////////////////

module.exports = router;