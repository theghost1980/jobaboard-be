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
const ssc = new SSC('http://185.130.45.130:5000/');

//get all NFT issued by main acc.
router.get('/allNFTs', function(req, res){
    console.log(req.params);
    // if(checkId(req.params.id.toString())){
    ////////////
    //check for a valid token
    var token = req.headers['x-access-token'];
    // console.log('Token', token);
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //test to make a query to the test node.
            ssc.find("nft", "nfts", { issuer: "jobaboard"} , null, 0, [], (err, result) => {
                if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
                    console.log(result);
                    res.status(200).send(result);
            });
        }
    });
});

module.exports = router;