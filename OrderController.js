var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Order = require('./Orders');
var Order_Market = require('./Orders_Market');
var Review = require('./Review');
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

//look up into orders by filter and options
router.get('/getOrderquery', function(req,res){ // const headers = { 'x-access-token': , 'query': JSON.stringify({ }), 'limit': 0, 'sortby': JSON.stringify({ null: 'null' }), }
    const token = req.headers['x-access-token'];
    const query = req.headers['query'];
    const limit = Number(req.headers['limit']);
    const sortby = JSON.parse(req.headers['sortby']);
    const jsonQuery = JSON.parse(query);
    if(!jsonQuery) {
        console.log('A null || public empty query has been made on Orders!');
        return res.status(404).send({ status: 'funny', message: "I cannot process that!"});
    }
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

        if(decoded){
            //TODO process the query check for nulls || "" and create teh newQuery.
            const newNode = {};
            Object.entries(jsonQuery).forEach(([key, val]) => {
                if(val !== null && val !== ""){
                    return (newNode[key] = val);
                }
            });
            console.log('New query to process on Orders, user:',decoded.usernameHive);
            console.log(newNode, `Limit:${limit}`);
            console.log('Sortby:',sortby);
            Order.find(newNode,function(err,orders){
                if(err){
                    if(config.testingData){
                        console.log('Error finding Order',err);
                    }
                    return res.status(500).send({ error: 'Error searching for Orders', message: err});
                }
                return res.status(200).send({ status: 'sucess', result: orders });
            }).limit(limit).sort(sortby.hasOwnProperty("null") ? null : sortby);
        }else{
            return res.status(404).send({ auth: false, message: 'Failed to decode token.' });
        }
    });
});
//END look up into orders by filter and options

//Update the status of an order as "Completed", "Reported", "Cancelled by Employer"
// this update is made just by the user who made the order. All the rest is handled in admincontroller.
// will affect reviews when order is marked as completed.
//The logic will be: the employer wants to set an order as completed or report.
// if report must provide a reason from a list select defined on FE.
// "Reported" reasons.
// 1. The time is up and I got no results.
// 2. The other part has miss on completing the order as agreed or miss my notes/specifications.
// 3. I haven't received the tokens I was promised.
// 4. Other, specify.
// "Completed"
// User must review first and send all the data.
// we mark the order as completed + append the new review.
// "Cancelled by Employer"
// 1. I am aware that cancelling the order before complexion, means I cannot ask for refunds.
// 2. I did this order by mistake, I will contact the other part to agree for a refund.
// 3. The other part told me he/she cannot fullfill this order, so we will adjust the tokens.
// 4. Other, specify.
router.post('/updateOrderStatus', function(req,res){
    const token = req.headers['x-access-token'];
    const status = req.headers['status']; //"Completed", "Reported", "Cancelled"
    const id_order = req.headers['id_order']; //mandatory for any option.
    //To parse order_data later on.
    
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    if(!status) return res.status(404).send({ status: 'failed', message: 'No status provided!' });
    if(!id_order) return res.status(404).send({ status: 'failed', message: 'No id_order provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            if(status === "Completed"){
                upload(req, res, function(err){
                    if(err){
                        console.log('Error processing on multer.',err);
                        return res.status(500).send({ status: 'failed', message: err});
                    };
                    let promise_Update_Order = new Promise((resolve, reject) => {
                        Order.findByIdAndUpdate(id_order, { status: status }, { new: true }, function(err,updated){
                            if(err) reject(err);
                            resolve(updated);
                        });
                    });
                    promise_Update_Order.then(result => {
                        const dataReview = req.body; //now we add the review
                        dataReview['stars_rated'] = JSON.parse(dataReview['stars_rated']);
                        if(config.testingData){ console.log(`Making a review on order_id:${id_order}, with data:`, dataReview)};
                        Review.create(dataReview, function(err,created){
                            if(err){
                                if(config.testingData){ console.log(`Error adding a review for order_id:${id_order}.`, err)};
                                return res.status(500).send({ status: 'failed', message: err });
                            }
                            if(config.testingData){ console.log(`Created a review for order_id:${id_order}.`, created)};
                            return res.status(200).send({ status: 'sucess', message:`Order id ${id_order} status updated to ${status}.`, result_review: created, result_order: result });
                        });
                    }).catch(error => {
                        if(config.testingData){ console.log(`Error when updating order_id:${id_order}.`, error)};
                        return res.status(500).send({ status: 'failed', message: error });
                    })
                });
            }else{ //"Reported" || "Cancelled"
                upload(req, res, function(err){
                    if(err){
                        if(config.testingData) { console.log('Error processing on multer.',err) };
                        return res.status(500).send({ status: 'failed', message: err});
                    };
                    const dataOrder = req.body; //now we add the review
                    dataOrder['status'] = status;
                    if(config.testingData) { console.log('About to update:', dataOrder)};
                    Order.findByIdAndUpdate(id_order, dataOrder, { new: true }, function(err,updated){
                        if(err){
                            if(config.testingData) { console.log(`Error Updating order:${id_order}.`,err) };
                            return res.status(500).send({ status: 'failed', message: err});
                        };
                        return res.status(200).send({ status: 'sucess', message:`Order id ${id_order} status updated to ${status}.`, result_order: updated });
                    });
                });
            }
        }else{
            return res.status(404).send({ auth: false, message: 'Failed to decode token.' });
        }
    });
});

//END Update the status of an order.

///////Methods to handle Market Orders //////////
router.post('/handleMarketOrder', function(req,res){
    const token = req.headers['x-access-token'];
    const operation = req.headers['operation']; //as 'create', 'update', 'cancel'
    const order_id = req.headers['order_id'];
    if(!operation) return res.status(404).send({ auth: false, message: 'No operation provided!' });
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(404).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            upload(req,res, function(err){
                if(err){
                    if(config.testingData){ console.log('Error on multer', err)};
                    return res.status(500).send({ status: 'failed', message: err});
                }
                const data = req.body['data'];
                if(!data) return res.status(404).send({ status: 'failed', message: 'Fatal no data provided. [{}]' });
                const pData = JSON.parse(data);
                if(config.testingData){
                    console.log('About to:', operation);
                    console.log('Original Data:', data);
                    console.log('Parsed Data:', pData);
                }
                if(operation === 'create'){
                    Order_Market.insertMany(pData, function(err, result){
                        if(config.testingData){ 
                            console.log('Error creating order:', err)
                            return res.status(500).send({ status: 'failed', message: err});
                        };
                        return res.status({ status: 'sucess', result: result });
                    });
                }else{
                    if(!order_id) return res.status(404).send({ auth: false, message: 'No order_id provided!' });
                    if(operation === 'update'){

                    }else if(operation === 'cancel'){

                    }
                }
            });
        }else{
            return res.status(404).send({ auth: false, message: 'Failed to decode token.' });
        }
    })
});
router.post('/createMarketOrder', function(req,res){ //using this same one but with modifications
    //testing fire another one
    const token = req.headers['x-access-token'];
    const operation = req.headers['operation']; //as 'create', 'update', 'cancel'
    const order_id = req.headers['order_id'];
    if(!operation) return res.status(404).send({ auth: false, message: 'No operation provided!' });
    if(!order_id) return res.status(404).send({ auth: false, message: 'No order_id provided!' });
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(404).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            upload(req,res, function(err){
                if(err){
                    if(config.testingData){ console.log('Error on multer', err)};
                    return res.status(500).send({ status: 'failed', message: err});
                }
                const data = req.body;
                if(config.testingData){ console.log(`About to ${operation}:`, data)};
                if(operation !== 'cancel'){
                    const item_type = data.item_type;
                    if(config.testingData){ 
                        console.log('item_type:',item_type);
                        console.log('original nft_instances', data.nft_instances);
                    };
                    if(item_type === "instance"){
                        data.nft_instances = JSON.parse(data.nft_instances);
                        if(config.testingData){ console.log('parsed field: ', data.nft_instances)};
                    }else{
                        data.nft_definitions = JSON.parse(data.nft_definitions);
                        if(config.testingData){console.log('parsed field: ', data.nft_definitions)} ;
                    }
                }
                if(config.testingData){ console.log(`About to ${operation}(parsed data):`, data)};
                if(operation === 'create'){
                    Order_Market.create(data, function(err, newOrder){
                        if(err){
                            if(config.testingData){ console.log('Error creating order:', err)};
                            return res.status(500).send({ status: 'failed', message: err});
                        }
                        return res.status(200).send({ status: 'sucess', result: newOrder, message: `Order created. You can navigate to Marketplace > My Orders for review. Keep JABing!`})
                    });
                }else if(operation === 'update' || operation === 'cancel'){
                    Order_Market.findByIdAndUpdate(order_id, data, { new: true }, function(err, updated){
                        if(err){
                            if(config.testingData){ console.log('Error updating order:', err)};
                            return res.status(500).send({ status: 'failed', message: err});
                        }
                        return res.status(200).send({ status: 'sucess', result: updated, message: `Order Updated. Keep JABing!`})
                    });
                }
            });
        }else{
            return res.status(404).send({ auth: false, message: 'Failed to decode token.' });
        }
    });
});

router.get('/getMarketOrder', function(req,res){
    const token = req.headers['x-access-token'];
    const query = JSON.parse(req.headers['query']);
    const limit = Number(req.headers['limit']);
    const sortby = JSON.parse(req.headers['sortby']);
    if(config.testingData) { console.log(req.headers)};
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            console.log('New query to process on MarketOrders, user:', decoded.usernameHive);
            console.log(query, `Limit:${limit}`);
            console.log('Sortby:',sortby);
            Order_Market.find(query,function(err,orders){
                if(err){
                    if(config.testingData){ console.log('Error finding MarketOrders',err) };
                    return res.status(500).send({ status: 'failed', message: err});
                }
                return res.status(200).send({ status: 'sucess', result: orders });
            }).limit(limit).sort(sortby);
        }else{
            return res.status(404).send({ auth: false, message: 'Failed to decode token.' });
        }
    });
});
///////END Methods to handle Market Orders //////////

module.exports = router;