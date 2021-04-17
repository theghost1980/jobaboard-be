var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Order = require('./Orders');
var jwt = require('jsonwebtoken');
var config = require('./config');
// const formidable = require('formidable');
const time = new Date();
// const util = require('util');
//using on this router
router.use(bodyParser.urlencoded({ extended: true })); //use it to handle the data upcomming.
router.use(bodyParser.json());

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

//declarations
//cloudinary CDN images
var cloudinary = require('cloudinary').v2;
//config
cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret,
});
/////////////
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if(config.testingData){ 
            (file) ? console.log('Destination:::::::File::::::',file) : console.log('No file from client');
        }
        callback(null, __dirname + '/uploads')
    },
    filename: function (req, file, callback) {
        if(config.testingData){ 
            (file) ? console.log('Filename:::::::File::::::',file) : console.log('No file from client');
        }
        callback(null, file.fieldname + '_' + Date.now() + "_" + file.originalname);
    }
});  
const upload = multer({ storage: storage }).single("file");

//////to delete the file after sending it to cloud
const fs = require('fs');
let resultHandler = function (err) {
    if (err) {
        console.log("unlink failed", err);
    } else {
        console.log("file deleted from temporary server storage");
    }
}
////////////////////////////////////////////////////////////////////

////////Handle the new icon image to upload and send back the image + thumb.
// router.post('/uploadIcon', async function(req,res){
//     const token = req.headers['x-access-token'];
//     const sharp = require('sharp');
//     if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
//     jwt.verify(token, config.secret, function(err, decoded){
//         if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
//         if(decoded){
//             //now multer will work...work b
//             upload(req, res, function(err){
//                 if(err){
//                     console.log('Error processing on multer.',err);
//                     // testing suppressing the error handler as I saw this made by other devs ???
//                     // results: 
//                     return res.status(500).send({ status: 'failed', message: err});
//                 };
//                 //upload the data and grab the results.
//                 if(req.file){
//                     console.log('There is file, so lets use them');
//                     cloudinary.uploader.upload(req.file.path,{ tags: 'iconNFT'}, function(error, result){
//                         if(error){
//                             console.log('Error uploading img to cloudinary.',error);
//                             return res.status(500).send({ status: 'failed', message: error});
//                         }
//                         //image is the uploaded img
//                         image = result.secure_url;
//                         console.log(`Image uploaded on update NFT info. ${image}`);
//                         let inputFile = req.file.path;
//                         let outputFile = "thumb-" + Date.now() + req.file.originalname;
//                         sharp(inputFile).resize({ width: 120 }).toFile(outputFile)
//                         .then(function(newFileInfo) {
//                             newFileInfo.path = outputFile;
//                             console.log(`Now we handle to upload:`);
//                             console.log(newFileInfo);
//                             cloudinary.uploader.upload(newFileInfo.path,{ tags: 'NFTImageThumb'}, function(error, thumbUploaded){
//                                 if(error){ 
//                                     console.log('Error uploading thumb.');
//                                     return res.status(500).send({ status: 'failed', message: "Error uploading thumb, please check. " + error});
//                                 }
//                                 console.log('Sucess, thumb uploaded. Now we get the new name.');
//                                 thumb = thumbUploaded.secure_url;
//                                 console.log(`Thumb uploaded. ${thumb}`);
//                                 // after resizing + uploading then we erase the file from storage
//                                     // now delete the files from local storage.
//                                     fs.unlink(req.file.path, resultHandler);
//                                     fs.unlink(newFileInfo.path, resultHandler);
//                                 //we send back the new image + thumb.
//                                 return res.status(200).send({ status: 'sucess', dataIcon:{ image: image, thumb: thumb }});
//                             });
//                         })
//                         .catch(function(err) {
//                             console.log("Error occured when resizing img",err);
//                         });
//                     });
//                 }else{
//                     //no img file we return error.
//                     return res.status(500).send({ status: 'failed', message: "Image must be provided to use this route."});
//                 }
//             });
//         }else{
//             return res.status(404).send({ auth: false, message: 'Failed to decode user!!!.'});
//         };
//     });
// });
//////// END Handle the new icon image to upload

//////////////////
// todo: erase this testings handling the formdata + upload only 1 image + resize it to create the thumb.
// const uploadtest = multer({ dest: 'uploads/' }) // to test without storing or saving the image anywhere.

// router.post('/addNFTDB', function(req, res){
//     const token = req.headers['x-access-token'];
//     const sharp = require('sharp');
//     var image,thumb;
//     if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
//     jwt.verify(token, config.secret, function(err, decoded){
//         if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

//         if(decoded){
//             const nft_id = req.headers['id'];
//             console.log(`Here we will search on this token to not waste resouces so multer wont work for now! ID:${nft_id}`);
//             Nft.findOne({ nft_id: nft_id }, function(err, found){
//                 if(err) {
//                     console.log('Errof searching on DB.', err);
//                     return res.status(500).send({ status: 'failed', message: err });
//                 };
//                 if(found){
//                     console.log('Found on DB.',found);
//                     return res.status(404).send({ status: 'failed', message: 'Exists, choose another id please'});
//                 }else{
//                     //now multer will work...work b
//                     upload(req, res, function(err){
//                         if(err){
//                             console.log('Error processing on multer.',err);
//                             return res.status(500).send({ status: 'failed', message: err});
//                         };
//                         //upload the data and grab the results.
//                         if(req.file){
//                             console.log('There is file, so lets use them');
//                             cloudinary.uploader.upload(req.file.path,{ tags: 'testNFTImage'}, function(error, result){
//                                 if(error){
//                                     console.log('Error uploading img to cloudinary.',error);
//                                     //for now we will continue with the whole process so it will use the
//                                     // defaults images on db for the newly nft.
//                                 }
//                                 //image is the uploaded img
//                                 image = result.secure_url;
//                                 console.log(`Image uploaded. ${image}`);
//                                 //here we should apply the transformation and upload it also.
//                                 // we will test sharp to resize the image and upload it as well, then we take both fields and save into db
//                                 let inputFile = req.file.path;
//                                 let outputFile = "thumb-" + Date.now() + req.file.originalname;
//                                 sharp(inputFile).resize({ width: 120 }).toFile(outputFile)
//                                 .then(function(newFileInfo) {
//                                     // newFileInfo holds the output file properties
//                                     // console.log(`Success resizing ${inputFile}`);
//                                     newFileInfo.path = outputFile;
//                                     console.log(`Now we handle to upload:`);
//                                     console.log(newFileInfo);
//                                     cloudinary.uploader.upload(newFileInfo.path,{ tags: 'testNFTImageThumb'}, function(error, thumbUploaded){
//                                         if(error){ console.log('Error uploading thumb.')}
//                                         console.log('Sucess, thumb uploaded. Now we get the new name.');
//                                         thumb = thumbUploaded.secure_url;
//                                         console.log(`Thumb uploaded. ${thumb}`);
//                                         // after resizing + uploading then we erase the file from storage
//                                             // now delete the files from local storage.
//                                             fs.unlink(req.file.path, resultHandler);
//                                             fs.unlink(newFileInfo.path, resultHandler);
//                                         saveNFT(req);
//                                     });
//                                 })
//                                 .catch(function(err) {
//                                     console.log("Error occured when resizing img",err);
//                                 });
//                             });
//                         }else{
//                             //no img file we use defaults.
//                             saveNFT(req);
//                         }
//                     });
//                 }
//             });
//         }else{
//             res.status(404).send({ auth: false, message: 'Failed to decode user!!!.'});
//         }
//     });
//     //////////////////inned functions
//     //function to handle the saving process
//     function saveNFT(req){
//         //we create it or at leaast we try to
//         var data = req.body;
//         if(image && thumb){
//             data.image = image;
//             data.thumb = thumb;
//         }
//         // data.authorizedIssuingAccounts = JSON.parse(data.authorizedIssuingAccounts);
//         console.log("We're about to save::::");
//         console.log(data);
//         Nft.create(data, function(err,newNft){
//             if(err){
//                 console.log('Error when adding new NFT.',err);
//                 res.status(500).send({ status: 'failed', message: err});
//             }
//             console.log('Added new NFT',newNft);
//             res.status(200).send({ status: 'success', result: newNft});
//         })
//     };
// });

// end testing

// update NFT. first udpate just 1 field as we will need this to update a particualr field, i.e: just the supply, burned, updatedAt, etc.
router.post('/createOrder', function(req,res){
    const token = req.headers['x-access-token'];
    const filter = req.headers['filter']; //as stringifyed {job_title: 'value', username: decoded, xxx } xxx: choose from 'username_employer' or 'username_employee'
    if(!filter) { return res.status({ status: 'failed', message: 'No filter provided.'})};
    const jsonFilter = JSON.parse(filter);
    // const query = req.headers['query'];
    // const jsonQuery = JSON.parse(query);
    // if(!jsonQuery) {
    //     console.log('A null || empty query has been made!');
    //     return res.status(404).send({ status: 'funny', message: "I cannot process that!"});
    // }else{
    //     console.log('To modify fields:');
    //     console.log(jsonQuery);
    // };
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(404).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //maybe just check if job_title exists 
            Order.findOne(jsonFilter , function(err, found){
                if(err){
                    if(config.testingData){ console.log('Error processing order', err)}
                    return res.status(500).send({ status: 'failed', message: err});
                }
                if(found){//we send a warning messsage to user to double check as there is one order similiar to this one
                    return res.status(500).send({ status: 'warning', message: 'There is one Gig/Job using the same title, please double check before proceeding. Click on the link bellow to open the related order in a new window.'});
                }
                //now using multer to process the formdata
                //now multer will work...work b
                upload(req, res, function(err){
                    if(err){
                        console.log('Error processing on multer.',err);
                        return res.status(500).send({ status: 'failed', message: err});
                    };
                    if(req.file){
                        // todo if we may need later on to handle files
                    }else{
                        const data = req.body;
                        if(config.testingData){
                            console.log('About to save:');
                            console.log(data);
                        }
                        Order.create(data, function(err, newOrder){
                            if(err){
                                if(config.testingData){ console.log('Error when creating a new order!',err)};
                                return res.status(500).send({ status: 'failed', message: err});
                            }
                            res.status(200).send({ status: 'sucess', result: newOrder});
                        });
                    }
                });
            });
        }else{
            res.status(404).send({ auth: false, message: 'Failed to decode user!!!.'});
        }
    });
});

//get all token based on query, handling the query on headers.
// router.get('/getNFTquery', function(req,res){
//     const token = req.headers['x-access-token'];
//     const query = req.headers['query'];
//     const limit = Number(req.headers['limit']);
//     const sortby = JSON.parse(req.headers['sortby']);
//     if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
//     jwt.verify(token, config.secret, function(err, decoded){
//         if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
//         if(decoded){
//             //query = { account: "", nft_id: "", symbol: "", sort: ""} + another params on headers limit: N || 0
//             // i will handle fields with something or Null.
//             // on lmit we handle 0 as none.
//             //process the query too see what fields are on/off and send to mongo
//             const jsonQuery = JSON.parse(query);
//             if(!jsonQuery) {
//                 console.log('A null || empty query has been made!');
//                 return res.status(404).send({ status: 'funny', message: "I cannot process that!"});
//             }
//             //TODO process the query check for nulls || "" and create teh newQuery.
//             const newNode = {};
//             Object.entries(jsonQuery).forEach(([key, val]) => {
//                 if(val !== null && val !== ""){
//                     return (newNode[key] = val);
//                 }
//             });
//             console.log('New query to process::::');
//             console.log(newNode, `Limit:${limit}`);
//             console.log('Sortby:',sortby);
//             Nft.find(newNode,function(err,tokens){
//                 if(err){
//                     if(config.testingData){
//                         console.log('Error finding Nft',err);
//                     }
//                     return res.status(500).send({ error: 'Error searching for Nft', message: err});
//                 }
//                 return res.status(200).send({ status: 'sucess', result: tokens });
//             }).limit(limit).sort(sortby.hasOwnProperty("null") ? null : sortby);

//         }else{
//             res.status(404).send({ auth: false, message: 'Failed to decode user!!!.'});
//         }
//     });
// });

module.exports = router;