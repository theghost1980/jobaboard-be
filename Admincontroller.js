var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./User');
var Logs = require('./Logs');
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

////////Web content section
/////handling adding a new cat if not found under same name & query as those are the important fields
router.post('/addCat', function(req,res){
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
            //forcing to rebuild
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


module.exports = router;