var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Nft = require('./Nft');
var jwt = require('jsonwebtoken');
var config = require('../config');
const time = new Date();

// NFT operations
// - creates an NFT. Logic:
//      - Search on hive under nft > nfts
//      - if not found. Check now on mongoDB nft
//          - if found, return error "symbol exists-choose another one".
//          - if not found --> create.
//              - broadcast json rpc usin params passed.
//              - wait for response.
//              - if response success.
//                  - add token to mongoDB.
//                  - return data to user.
//              - if error on response.
//                  - retry maybe?
//          - if found return error "symbol exists-choose another one".

//get nfts on this username
router.get('/:username', function(req, res){
     //check for a valid token
     var token = req.headers['x-access-token'];
     if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
     jwt.verify(token, config.secret, function(err, decoded){
         if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
         if(decoded){
             //search nfts first on hive
             
         }else{
             //
         }
     });
});