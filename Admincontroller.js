var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./User');
var Logs = require('./Logs');
var Job = require('./Job');
const Nft = require('./Nft');
var Image = require('./Image'); //this one for now do not a controller but can be used anywhere, for now just in admincontroller.
var Img = require('./Img'); //using this one as it seems when created it prints the first config and cannot change later on
var Category = require('./Category');
// TODO: add logs access withint admincontroller and remove it from
// logs- maybe?
// var Logs = require('../logs/Logs');
var jwt = require('jsonwebtoken');
var config = require('./config');
const time = new Date();
const sharp = require('sharp');

//in order to being able to handle images here all definitions on cloudinary + multer
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
const uploadMultiple = multer({ storage: storage }).array("file"); //to use on multiple so we can keep the first one as uploading one file only
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

// BAN USER
// ---> TODO: Ask for better logic, maybe just the admins can ban users and not admins.
router.post('/ban/:username', function(req, res){
    var token = req.headers['x-access-token'];
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            // console.log(decoded);
            // To apply more secufiry we could look up this user as admin....
            const data = req.body;
            console.log(data);
            // console.log(`User to be Banned: ${data.username}\n Reason: ${data.reason}`);

            User.findOneAndUpdate({ username: data.username }, { banned: true }, {new: true}, function(err, user){
                if(err) return res.status(500).send("There was a problem banning the user.");
                //user banned so create log
                //create log
                // -----> TODO search this Admin on DB and bring his data.
                Logs.create({
                    username: decoded.username,
                    usertype: 'admin', 
                    createdAt: time,
                    ipaddress: req.ip,
                    event: `Banning ${data.username}`,
                    reason: data.reason,
                    },
                    function(err, log){
                        if(err){console.log('Error trying to add new Log on DB!',err)}
                        if(log){ 
                            console.log(`logID:${log.id}`);
                        } 
                    }
                );
                res.status(200).send(user);
                console.log(`Updated User on DB. \n username:${user.username} \n time:${time}\nNew Status: Banned!`);
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Error authenticating token GET user.' });
        }
    });
})

/////////////////////////
//////handle get the images on DB
router.get('/getImgBank',function(req,res){
    const token = req.headers['x-access-token'];
    const filter = JSON.parse(req.headers['filter']) || {};
    const limit = Number(req.headers['limit']) || 0; //just in case no number comes from request.
    const sort = JSON.parse(req.headers['sort']) || {}; //as { createdAt: -1 } { field: -1} -1 desc || { field: 1} 1 asc.
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            if(config.testingData){
                console.log('filtering on jobs AdminController:',filter);
                console.log('Limit:',limit);
                console.log('Sort:',sort)
            }
            Img.find(filter, function(err, imgs){
                if(err){
                    if(config.testingData) {console.log('Error finding on images bank',err)};
                    return res.status(500).send({ status: 'failed', message: err });
                }
                return res.status(200).send({ status: 'sucess', result: imgs });
            }).sort(sort).limit(limit)
        }else{
            return res.status(500).send({ auth: false, message: 'Failed to decode token.' });
        }
    });
});
//////END handle get the images on DB
//////handle get the images on DB
router.post('/deleteImgOnBank',function(req,res){
    // TODO: i have a better idea, we should use the OPlogger right here instead that on client.
    // this will improve client's performance as server is much more powerful...DA!!!
    const token = req.headers['x-access-token'];
    const filter = JSON.parse(req.headers['filter']); //as { _id: '' } in order to handle it better.
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            if(config.testingData){
                console.log('filtering to Delete on jobs AdminController:',filter);
            }
            Img.deleteOne(filter, function(err, ack){
                if(err){
                    if(config.testingData) {console.log('Error deleting on images bank',err)};
                    return res.status(500).send({ status: 'failed', message: err });
                }
                return res.status(200).send({ status: 'sucess', result: ack });
            })
        }else{
            return res.status(500).send({ auth: false, message: 'Failed to decode token.' });
        }
    });
});
//////END handle get the images on DB
//////Special sections a upload images into Images Bank for the blog
router.post('/uploadImgsToBank',function(req,res){
    const token = req.headers['x-access-token'];
    const thumbs = req.headers['createthumbs']; //as 'true' or 'false'
    if(config.testingData){ 
        console.log(req.headers);
        console.log(`thumbs: ${thumbs}`);
    };
    var thumbImagesUploaded = [];
    //TODO check if userType = 'admin'
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //cloudinary loop depending if at least one image to upload to server and then CDN.
            uploadMultiple(req, res, function (err) {
                if (err) {
                    console.log('Err Uploading Multiple Images.',err);
                    return res.status({ status: 'failed', message: err });
                }
                if(thumbs === 'true' || thumbs === "true"){
                    if(config.testingData) { console.log('Creating thumbs as requested!!!')};
                    let promise_thumbs = req.files.map(file => new Promise((resolve,reject) => {
                        let outputFile = "thumb-" + Date.now() + file.originalname;
                        sharp(file.path).resize({ width: 100 }).toFile(outputFile)
                        .then(function(newFileInfo) {
                            newFileInfo.path = outputFile;
                            resolve(newFileInfo.path);
                            fs.unlink(newFileInfo.path, resultHandler);
                        })
                        .catch(err => reject(err));
                    }));
                    Promise.all(promise_thumbs)
                    .then(result => { //result is the array holding the thumb images as we need them.
                        const thumbImages = result;
                        return res.status(200).send({ status: 'sucess', result: thumbImages });
                    }).catch((error) => { res.status(500).send({'status': 'failed', 'message': error})});

                    // let promise_thumbs = req.files.map(file => new Promise((resolve,reject) => {
                    //     let outputFile = "thumb-" + Date.now() + file.originalname;
                    //     sharp(file.path).resize({ width: 100 }).toFile(outputFile)
                    //     .then(function(newFileInfo) {
                    //         newFileInfo.path = outputFile;
                    //         console.log('Now we handle to upload:',newFileInfo);
                    //         cloudinary.uploader.upload(newFileInfo.path,{ tags: 'JABImageThumb'}, function(error, thumbUploaded){
                    //             if(error){ console.log('Error uploading thumb.')}
                    //             thumbImagesUploaded.push(thumbUploaded.secure_url);
                    //             if(config.testingData){
                    //                 console.log('Thumb uploaded.');
                    //                 console.log(thumbUploaded);
                    //             }
                    //             fs.unlink(newFileInfo.path, resultHandler); // now delete the thumb files from local storage to prevent over files flow.
                    //         });
                    //     })
                    //     .catch(function(err) {
                    //         if(config.testingData){ console.log("Error occured when resizing img",err) };
                    //         return res.status(500).send({ status: 'failed', message: err });
                    //     });
                    // });
                    // todo and move the create process to it own function and pass the req + thumbImagesUploaded.
                }else{
                    // todo and move the create process to it own function and pass just the req.
                    return res.status(404).send({ status: 'failed', message: 'Still need to improve this router!'});
                }
                //stoping until here for testing the thumbs processing
                let res_promises = req.files.map(file => new Promise((resolve,reject) => {
                    cloudinary.uploader.upload(file.path,{ tags: JSON.parse(req.body.tags)}, function(err, image){
                        if(err) reject(err) 
                        else {
                            resolve(image.secure_url);
                            fs.unlink(file.path, resultHandler);
                        }
                    })
                }))
                Promise.all(res_promises)
                .then(result => { //result is the array holding the images as we need them.
                    const images = result;
                    if(config.testingData){ console.log('To save:',images)};
                    //at this point if we have thumbImages !== null then we use them.
                    let save_promises = images.map(image => new Promise((resolve,reject) => {
                        Img.create({ image: image, title: req.body.title, createdAt: req.body.createdAt, relatedTo: JSON.parse(req.body.relatedTo), tags: JSON.parse(req.body.tags)}, function(err,createdImg){
                            if(err) reject(err) 
                            else {
                                resolve(createdImg);
                            }
                        })
                    }))
                    Promise.all(save_promises)
                    .then(result =>{//result is the array holding the images as we need them.
                        if(config.testingData){ console.log('Created new images:', result)};
                        return res.status(200).send({ status: 'sucess', result: result }) //sucess
                    })
                    .catch((error) => { res.status(500).send({'status': 'failed', 'message': error})});
                })
                .catch((error) => { res.status(400).send({'status': 'failed', 'message': error})});
            });
            //END cloudinary loop
        }else{
            return res.status(500).send({ auth: false, message: 'Failed to decode token.' });
        }
    });
});
//////END Special sections a upload images into Images Bank for the blog

///////Job sections controlled by Admins
///////////handling job queries from admins
router.get('/getJob', function(req,res){
    const token = req.headers['x-access-token'];
    const filter = JSON.parse(req.headers['filter']) || {};
    const limit = Number(req.headers['limit']) || 0; //just in case no number comes from request.
    const sort = JSON.parse(req.headers['sort']) || {}; //as { createdAt: -1 } { field: -1} -1 desc || { field: 1} 1 asc.
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            if(config.testingData){
                console.log('filtering on jobs AdminController:',filter);
                console.log('Limit:',limit);
                console.log('Sort:',sort)
            }
            Job.find(filter, function(err, jobs){
                if(err){
                    if(config.testingData) {console.log('Error finding jobs',err)};
                    return res.status(500).send({ status: 'failed', message: err });
                }
                return res.status(200).send({ status: 'sucess', result: jobs });
            }).sort(sort).limit(limit)
        }else{
            return res.status(500).send({ auth: false, message: 'Failed to decode token.' });
        }
    });
});
///////////END handling job queries from admins
//////////handling update one field on job by admins || system - originally just to handle blocked, note.
router.post('/updateJobField', function(req,res){
    const token = req.headers['x-access-token'];
    const filter = JSON.parse(req.headers['filter']);//as { username: '', _id: ''} mandatory to process the update
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            upload(req, res, function(err){
                if(err){
                    console.log('Error processing on multer.',err);
                    return res.status(500).send({ status: 'failed', message: err});
                };
                //upload the data and grab the results.
                if(config.testingData){
                    console.log('filtering on Update/job AdminController:',filter);
                    console.log('Admin:', decoded.usernameHive);
                    console.log('About to update:',req.body);
                }
                if(req.file){
                    //for now we don't use this but leave it for future use.
                }else{
                    Job.findOneAndUpdate(filter, req.body, { returnNewDocument: true },function(err, updatedJob){
                        if(err){
                            if(config.testingData) {console.log('Error updating fields on jobs',err)};
                            return res.status(500).send({ status: 'failed', message: err });
                        }
                        return res.status(200).send({ status: 'sucess', result: updatedJob });
                    });
                }
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Failed to decode token.' });
        }
    });

});
///////END Job sections controlled by Admins

////////Web content section
///handling delete category
router.post('/deleteCat', function(req,res){
    // TODO, for each of the admin methods we MUST check if admin as user_type
    // make a method that by using the username.decoded, finds on user and return true if admin. false otherwise.
    const token = req.headers['x-access-token'];
    const catid = req.headers['catid'];
    if(!catid){
        if(config.testingData){ console.log('Cat deletion request no id provided.')}
        return res.status(404).send({ status: 'failed', message: 'I cannot delete no Id cat. Funny guy!'});
    }
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            Category.deleteOne({ _id: catid }, function(err,deleted){
                if(err){
                    if(config.testingData){ console.log('Error when deleting Category.',err)};
                    return res.status(500).send({ status: 'failed', message: err });
                }
                return res.status(200).send({ status: 'sucess', result: deleted });
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Failed to decode token.' });
        };
    });
});
////handling update a cat.
router.post('/updateCat', function(req,res){
    var image,thumb;
    const token = req.headers['x-access-token'];
    const query = req.headers['query']; //as { name: 'string', query: 'string'} name of category and query in order to search if already exists or not.
    if(!query){
        if(config.testingData){ console.log('Not query provided.')};
        return res.status(404).send({ status:'failed', message: 'I cannot process empty queries. Funny boy!'});
    }
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            const filter = JSON.parse(query);
            Category.findOne(filter, function(err,catFound){
                if(err){
                    if(config.testingData){console.log('Error searching for category.',err)};
                    return res.status(500).send({ status: 'failed', message: err});
                }
                if(!catFound){
                    if(config.testingData){console.log('Category not exists.')};
                    return res.status(404).send({ status: 'failed', message: 'Category not present on DB.'});
                }
                //as we don't find any, we add so multer get to work from here.
                upload(req, res, function(err){
                    if(err){
                        console.log('Error processing on multer.',err);
                        return res.status(500).send({ status: 'failed', message: err});
                    };
                    //upload the data and grab the results.
                    if(req.file){
                        if(config.testingData) {console.log('There is file on new cat, so lets use it!')};
                        cloudinary.uploader.upload(req.file.path,{ tags: 'newCat'}, function(error, result){
                            if(error){
                                console.log('Error uploading img to cloudinary.',error);
                                //as we really need the image to make the cat work we stop here and return err
                                return res.status(500).send({ status: 'failed', message: error});
                            }
                            //image is the uploaded img
                            image = result.secure_url;
                            if(config.testingData) {console.log(`Image uploaded. ${image}`)};
                            //here we should apply the transformation and upload it also.
                            // we will test sharp to resize the image and upload it as well, then we take both fields and save into db
                            let inputFile = req.file.path;
                            let outputFile = "thumb-" + Date.now() + req.file.originalname;
                            sharp(inputFile).resize({ width: 200 }).toFile(outputFile) //thumb for cats is 200px wide for now
                            .then(function(newFileInfo) {
                                // newFileInfo holds the output file properties
                                // console.log(`Success resizing ${inputFile}`);
                                newFileInfo.path = outputFile;
                                console.log(`Now we handle to upload:`);
                                console.log(newFileInfo);
                                cloudinary.uploader.upload(newFileInfo.path,{ tags: 'newCatThumb'}, function(error, thumbUploaded){
                                    if(error){ 
                                        if(config.testingData) {console.log('Error uploading thumb.',error)}
                                        return res.status(500).send({ status: 'failed', message: error});
                                    }
                                    console.log('Sucess, thumb uploaded. Now we get the new name.');
                                    thumb = thumbUploaded.secure_url;
                                    console.log(`Thumb uploaded. ${thumb}`);
                                    // after resizing + uploading then we erase the file from storage
                                        // now delete the files from local storage.
                                        fs.unlink(req.file.path, resultHandler);
                                        fs.unlink(newFileInfo.path, resultHandler);
                                    updateCat(req,filter);
                                });
                            })
                            .catch(function(err) {
                                console.log("Error occured when resizing img",err);
                                return res.status(500).send({ status: 'failed', message: err});
                            });
                        });
                    }else{
                        //no img file but we update the rest of data!
                        updateCat(req,filter);
                    }
                });
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Failed to decode token.' });
        }
    });
    //function to handle the updating process
    function updateCat(req,filter){
        //we create it or at leaast we try to
        var data = req.body;
        if(image && thumb){
            data.image = image;
            data.thumb = thumb;
        }
        const sub_category = JSON.parse(data.sub_category);
        data.sub_category = [...sub_category];
        // data.authorizedIssuingAccounts = JSON.parse(data.authorizedIssuingAccounts);
        console.log("We're about to update::::");
        console.log(data);
        Category.updateOne(filter, data, function(err,updatedCat){
            if(err){
                console.log('Error when updating Category.',err);
                return res.status(500).send({ status: 'failed', message: err});
            }
            console.log('Updated Category',updatedCat);
            return res.status(200).send({ status: 'sucess', result: updatedCat});
        })
    };
});
/////handling adding a new cat if not found under same name & query as those are the important fields
router.post('/addCat', function(req,res){
    var image,thumb;
    const token = req.headers['x-access-token'];
    const query = req.headers['query']; //as { name: 'string', query: 'string'} name of category and query in order to search if already exists or not.
    if(!query){
        if(config.testingData){ console.log('Not query provided.')};
        return res.status(404).send({ status:'failed', message: 'I cannot process empty queries. Funny boy!'});
    }
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            const filter = JSON.parse(query);
            Category.findOne(filter, function(err,catFound){
                if(err){
                    if(config.testingData){console.log('Error searching for category.',err)};
                    return res.status(500).send({ status: 'failed', message: err});
                }
                if(catFound){
                    if(config.testingData){console.log('Category already exists.', catFound)};
                    return res.status(404).send({ status: 'failed', message: 'Please choose another category Name and query.'});
                }
                //as we don't find any, we add so multer get to work from here.
                upload(req, res, function(err){
                    if(err){
                        console.log('Error processing on multer.',err);
                        return res.status(500).send({ status: 'failed', message: err});
                    };
                    //upload the data and grab the results.
                    if(req.file){
                        if(config.testingData) {console.log('There is file on new cat, so lets use it!')};
                        cloudinary.uploader.upload(req.file.path,{ tags: 'newCat'}, function(error, result){
                            if(error){
                                console.log('Error uploading img to cloudinary.',error);
                                //as we really need the image to make the cat work we stop here and return err
                                return res.status(500).send({ status: 'failed', message: error});
                            }
                            //image is the uploaded img
                            image = result.secure_url;
                            if(config.testingData) {console.log(`Image uploaded. ${image}`)};
                            //here we should apply the transformation and upload it also.
                            // we will test sharp to resize the image and upload it as well, then we take both fields and save into db
                            let inputFile = req.file.path;
                            let outputFile = "thumb-" + Date.now() + req.file.originalname;
                            sharp(inputFile).resize({ width: 200 }).toFile(outputFile) //thumb for cats is 200px wide for now
                            .then(function(newFileInfo) {
                                // newFileInfo holds the output file properties
                                // console.log(`Success resizing ${inputFile}`);
                                newFileInfo.path = outputFile;
                                console.log(`Now we handle to upload:`);
                                console.log(newFileInfo);
                                cloudinary.uploader.upload(newFileInfo.path,{ tags: 'newCatThumb'}, function(error, thumbUploaded){
                                    if(error){ 
                                        if(config.testingData) {console.log('Error uploading thumb.',error)}
                                        return res.status(500).send({ status: 'failed', message: error});
                                    }
                                    console.log('Sucess, thumb uploaded. Now we get the new name.');
                                    thumb = thumbUploaded.secure_url;
                                    console.log(`Thumb uploaded. ${thumb}`);
                                    // after resizing + uploading then we erase the file from storage
                                        // now delete the files from local storage.
                                        fs.unlink(req.file.path, resultHandler);
                                        fs.unlink(newFileInfo.path, resultHandler);
                                    saveCat(req);
                                });
                            })
                            .catch(function(err) {
                                console.log("Error occured when resizing img",err);
                                return res.status(500).send({ status: 'failed', message: err});
                            });
                        });
                    }else{
                        //no img file we ureturn error as image must be provided for any cat.
                        return res.status(404).send({ status: 'failed', message: 'Each new category must have an image. Please retry but adding an image, following the specifications.'});
                    }
                });
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Failed to decode token.' });
        };
    });
    //function to handle the saving process
    function saveCat(req){
        //we create it or at leaast we try to
        var data = req.body;
        if(image && thumb){
            data.image = image;
            data.thumb = thumb;
        }
        const sub_category = JSON.parse(data.sub_category);
        data.sub_category = [...sub_category];
        // data.authorizedIssuingAccounts = JSON.parse(data.authorizedIssuingAccounts);
        console.log("We're about to save::::");
        console.log(data);
        Category.create(data, function(err,newCat){
            if(err){
                console.log('Error when adding new Category.',err);
                res.status(500).send({ status: 'failed', message: err});
            }
            console.log('Added new Category',newCat);
            res.status(200).send({ status: 'sucess', result: newCat});
        })
    };
});
/////handling the categories + sub cats
router.get('/getCats', function(req,res){
    const token = req.headers['x-access-token'];
    const jsonQuery = JSON.parse(req.headers['query']);
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //as soon as we decode we search to verify is an admin.
            User.findOne({ username: decoded.usernameHive }, function(err,admin){
                if(err){
                    if(config.testingData){console.log('Error searching for admin.',err)};
                    return res.status(500).send({ status: 'failed', message: err});
                }
                if(admin.usertype != 'admin'){
                    if(config.testingData){ console.log('User not admin.',admin)};
                    return res.status(404).send({ status: 'failed', message: 'User not an admin!'});
                }else{
                    const filter = jsonQuery.query === "all" ? {} : jsonQuery;
                    Category.find(filter, function(err,category){
                        if(err){
                            if(config.testingData){console.log('Error searching for categories.',err)};
                            return res.status(500).send({ status: 'failed', message: err});
                        }
                        return res.status(200).send({ status: 'sucess', result: category});
                    });
                }
            })
        }else{
            return res.status(500).send({ auth: false, message: 'Failed to decode token.' });
        }
    });
});
////////END Web content section

//////////Handling NFTs///////////
///////Query NFTs on MongoDB
//get all token based on query, handling the query on headers.
router.get('/getNFTquery', function(req,res){
    const token = req.headers['x-access-token'];
    const query = req.headers['query'];
    const limit = Number(req.headers['limit']);
    const sortby = JSON.parse(req.headers['sortby']);
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            const jsonQuery = JSON.parse(query);
            if(!jsonQuery) {
                console.log('A null || empty query has been made!');
                return res.status(404).send({ status: 'funny', message: "I cannot process that!"});
            }
            //TODO process the query check for nulls || "" and create teh newQuery.
            const newNode = {};
            Object.entries(jsonQuery).forEach(([key, val]) => {
                if(val !== null && val !== ""){
                    return (newNode[key] = val);
                }
            });
            console.log('New query to process::::');
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

        }else{
            res.status(404).send({ auth: false, message: 'Failed to decode user!!!.'});
        }
    });
});
///////End Query NFTs on mongoDB
/////////END Handling NFTs////////


module.exports = router;