var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./User');
var Logs = require('./Logs');
var Nft_user = require('./Nft_user');
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

//using multer to manipulate the formdata
const multer = require('multer');
const uploadMultiple = multer().array("file");
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
    const sortby = req.headers['sortby']; //Optional as stringifyed i.e [{ index: "symbol", descending: false }]
    // TODO: this parsing has to be inside try/catch and it will serve as another checks on data
    const _query = JSON.parse(query);
    
    if(config.testingData){ console.log(_query); }
    // console.log('Token', token);
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //test to make a query to the test node.
            const _sortby = !sortby ? [{ index: "symbol", descending: false }] : JSON.parse(sortby);
            if(config.testingData){ console.log('About to query on:',_sortby)};

            ssc.find("nft", "nfts", _query, null, 0, _sortby, (err, result) => {
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

//handle queries on specific table > contract
router.get('/queryContractTable', function(req,res){
    const query = req.headers['query']; //as { table: '', contract: '', query: {}, limit: 0, offset: 0, indexes: [] };
    const token = req.headers['x-access-token'];
    if(!query) return res.status(404).send({ auth: false, message: 'No query provided!' });
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            if(config.testingData){ console.log('About to process:', query)};
            ssc.find(query.table, query.contract, query.query, query.limit, query.offset, query.indexes, (err, result) => {
                if(err){
                    if(config.testingData){ console.log('Error on query:', query) };
                    return res.status(500).send({ status: 'failed', message: err });
                }
                return res.status(200).send({ status: 'sucess', result: result });
            })
        }else{
            return res.status(404).send({ auth: false, message: 'Failed to decode user!!!.'});
        }
    });
});
//END //handle queries on specific table > contract

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
        }else{
            return res.status(404).send({ auth: false, message: 'Failed to decode user!!!.'});
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

///////////////////////////////Handling NFT creation/instantiation/transfer/burn ////////////////////////
//as we must use BEE to instantiate and tocreate, @jobaboard will be on charge on this 2 from BE side.
router.post('/createNFT',function(req,res){
    const token = req.headers['x-access-token'];
    //create the token, instantiate 1, then transferownership to user + transfer instance, then add it to mongoDB + update user.nft, return sucess results to user.
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            uploadMultiple(req,res, function(err){
                if(config.testingData){ console.log('Reading body as:',req.body)}
                // TODO for now let's handle it on client side
                // later on we will pass it over here if needed.
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Failed to decode token.' });
        }
    });
})
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
            .then(result => {
                console.log('Response when broadcast:',result);
                if(result.id){
                    getInfoTX(result.id, pToprocess);
                }else{
                    // TODO
                    //handle error as it must returns an ID as broadcasted.
                }
            }).catch(error => {
                console.log('Error while instantiation.',error); // TODO create new notification about: 'while ... we got an error, we will reviewing this soon' // TODO send this to OPLogger
                return res.status(500).send({ status: 'failed', message: error});
            });
        }else{
            return res.status(404).send({ auth: false, message: 'Failed to decode user!!!.'});
        }
    });
});

//neccessary funtions to use on this controller
/////check a TX recursive, if not found the tx, ask again as check
function getInfoTX(tx,toprocess){
    if(tx){
        console.log(`Checking on: ${tx}`);
        ssc.getTransactionInfo(tx, function(err, result){
            if(result === null){ 
                console.log('Response while checking on Tx:',result);
                console.log('askAgain');
                return setTimeout(getInfoTX(tx,toprocess),3000);
            }else{
                if(response.logs){
                    const logs = JSON.parse(response.logs);
                    console.log('Now received as response: ',logs);
                    const tknContracts = logs.events.filter(log => log.contract === "tokens");
                    const nftContracts = logs.events.filter(log => log.contract === "nft");
                    // console.log(tknContracts,nftContracts);
                    if(Number(toprocess.amount) === tknContracts.length && Number(toprocess.amount) === nftContracts.length){
                        //was succesfull dunno if we must handle in case of an error of issuing less than amount???
                        console.log(`We casted ${amount} of ${toprocess.symbol} Token(s)`);
                        //here we save the data into nft_user
                        const nfts = [];
                        const arrayEvents = logs.events;
                        arrayEvents.map(event => {
                            if(event.event === "issue"){
                                nfts.push(
                                    { ntf_id: Number(toprocess.nft_id), ntf_symbol: toprocess.symbol, nft_instance_id: Number(event.data.id), username: toprocess.to, createdAt: new Date()}
                                )
                            }
                        });
                        console.log('About to save new instances', nfts);
                        Nft_user.insertMany(nfts,function(err,result){
                            if(err){
                                if(config.testingData){ console.log('Error adding new instances.',err)};
                                return res.status(500).send({ status: 'failed', message: err});
                            }
                            //TODO optional: how to handle the notification about this????
                            return res.status(200).send({ status: 'sucess', result: result });
                        });
                    }
                    if(logs.errors){
                        //TODO handle the errors
                        
                    }
                }
            }
            if(err){
                if(config.testingData){console.log('Error fetching from RPC API hive.',err);}  
                return res.status(500).send({ result: 'error', error: err});
            }
            // if(config.testingData){console.log(result);}
            res.status(200).send(result);
        });
    }
}
//END neccessary functions
////////////////////////////////
///////////////////////////////END Handling NFT creation/instantiation/transfer/burn ////////////////////////

module.exports = router;