var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Nft = require('./Nft');
var jwt = require('jsonwebtoken');
var config = require('./config');
const time = new Date();

// NFT operations
// - As soon as the user creates a NFT, we send the req to add this
// nft id on nft table. nft_id from the id that comes from hive ssc.
// 

//get nfts on this username
// router.get('/:username', function(req, res){
//      //check for a valid token
//      var token = req.headers['x-access-token'];
//      if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
//      jwt.verify(token, config.secret, function(err, decoded){
//          if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
//          if(decoded){
//              //search nfts first on hive
             
//          }else{
//              //
//          }
//      });
// });

// TODO a find router just to prevent or lock or whatever  we may need in future.

//  Create NFt for user.
// as names are uniques no need to check if user already created it.
// on creation we will use the data, no need for image
// the images will be handled only if the user wants to update the NFT info.
router.post('/createNFT', function(req,res){
    const token = req.headers['x-access-token'];
    const id = req.headers['id'];
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //search nfts first on hive

            var data = {};
            data = req.body;
            console.log('To save:::',id);
            console.log(data);
            // Nft.findOne({ nft_id: id},function(err,token){
            //     if(err){
            //         if(config.testingData){
            //             console.log('Error finding Nft',err);
            //         }
            //         res.status(500).send({ error: 'Error searching for Nft', message: err});
            //     }
            //     if(token){
            //         //send error message to user
            //         res.status(404).send({ status: 'found', message: `This token's symbol is been taken at:${token.createdAt}, please choose another one.`})
            //     }else{
            //         //let's create it
            //         if(config.testingData){
            //             console.log('Creating nft:::');
            //         }
            //         Nft.create(req.body,function(err,_nft){
            //             if(err){
            //                 if(config.testingData){
            //                     console.log('Error creating Nft',err);
            //                 }
            //                 res.status(500).send({ error: 'Error creating the Nft', message: err});
            //             }
            //             if(config.testingData){ console.log(`Nft created for:${_nft.account} at:${_nft.createdAt}`)}
            //             res.status(200).send({ status: 'success', result: _nft});
            //         });
            //     }
            // });
        }else{
            res.status(404).send({ auth: false, message: 'Failed to decode user!!!.'});
        }
    });
});

module.exports = router;