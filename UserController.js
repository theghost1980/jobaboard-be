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

// TODO: IMporant
// We should think the most effective way
// any user must modify its profile image, this way we do not worry about
// if has hive image or not.
// so later on we handle the image within the CDN on cloudinary
// we may resize the avatar one so it will load faster.

//+++++++++++++++++++++++++++++++++++++++++++++++
///////////////////////////////////////////////////////////////////////////////
//////////Whole process to upload an image from client/////////////////////////
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
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if(file){
            console.log('Destination:::::::File::::::');
            console.log(file);
        }else{
            console.log('No file from client');
        }
        callback(null, __dirname + '/uploads')
    },
    filename: function (req, file, callback) {
        if(file){
            console.log('Filename:::::::File::::::');
            console.log(file);
        }else{
            console.log('No file from client');
        }
        callback(null, file.fieldname + '_' + Date.now() + "_" + file.originalname);
    }
});  
var upload = multer({ storage: storage }).single("file");

//////to delete the file after sending it to cloud
const fs = require('fs');
let resultHandler = function (err) {
    if (err) {
        console.log("unlink failed", err);
    } else {
        console.log("file deleted");
    }
}
//////////Whole process to upload an image from client/////////////////////////
////////////////////////////////////////////////////////////////////
////testing just to handle Images
router.post('/saveImage', function (req, res) {
    upload(req, res, function (err) {
      if (err) {
        // A Multer error occurred when uploading.
        console.log('Err',err);
      }
      cloudinary.uploader.upload(req.file.path, { tags: 'testBE'}, function(err, image){
        if (err) { console.warn(err); }
            if(config.testingData === "true"){
                console.log("* public_id for the uploaded image is generated by Cloudinary's service.");
                console.log("* " + image.public_id);
                console.log("* " + image.url);
            }
        //now send data backto user for now
        //to user inside the update user profile, instead it will do the whole process and when the res is received
        // it will stamp the new image url to the user's profile as: res.secure_url
        //maybe we could check if secure_url !== "" or null, other wise we should leave the img as it was.
        res.status(200).send(image);
        //erase the file from server.
        fs.unlink(req.file.path, resultHandler);
      })
    })
})
////end testing images
//////////END Whole process to upload an image from client/////////////////////////
///////////////////////////////////////////////////////////////////////////////
//+++++++++++++++++++++++++++++++++++++++++++++++

/////////////////////////
//Final routers for USERS
//Get user by username
router.get('/:username', function(req, res){
    // console.log(req.params);
    // if(checkId(req.params.id.toString())){
    ////////////
    //check for a valid token
    var token = req.headers['x-access-token'];
    // console.log('Token', token);
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            // console.log(decoded);
            User.findOne({ username: decoded.usernameHive },function(err, user){
                if(err) return res.status(500).send("There was a problem finding the user." + "\n" + err);
                if (!user) return res.status(404).send("No user found.");
                res.status(200).send(user);
                console.log(`Searched User on DB. \n name:${user.username} \n Time:${time}`);
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Error authenticating token GET user.' });
        }
    });
    // User.findOne({ username: req.params.username },function(err, user){
    //     if(err) return res.status(500).send("There was a problem finding the user." + "\n" + err);
    //     if (!user) return res.status(404).send("No user found.");
    //     res.status(200).send(user);
    //     console.log(`Searched User on DB. \n name:${user.username} \n Time:${time}`);
    // });
    // }else {
    //     console.log("A wrong ID formatted query was trying to reach the server's DB");
    //     return res.status(404).send("Id format is not as required. Please use correct one!");
    // }
})
//update user
//////-->>>testing with post to update the profile of a user
router.post('/update/:username', function(req, res){
    // console.log(req);
    var token = req.headers['x-access-token'];
    var avatar = null;
    var data = {};
    console.log(data);
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    if(token){
        //now verify the token.
        jwt.verify(token, config.secret, function(err, decoded){
            if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            if(decoded){
                console.log(`token verified!!!`);
                upload(req, res, function (error) {
                    if (error) {
                      // A Multer error occurred when uploading.
                      console.log('Err',error);
                    }
                    data = req.body;
                    if(config.testingData){
                        console.log('Body data:')
                        console.log(data);
                        // console.log(`Upcomming avatar:${data.avatar}`);
                    }
                    if(req.file){
                        if(config.testingData){
                            console.log(`Req.file.path:${req.file.path}`);
                            console.log(`Original Name:${req.file.originalname}`);
                            console.log(`New Name: ${req.file.filename}`);
                        };
                        cloudinary.uploader.upload(req.file.path, { tags: 'JobAboard'}, function(err, image){
                            if (err) { console.warn(err) }
                            if(config.testingData === "true"){
                                console.log("* User's profile uploaded to cloudinary!");
                                console.log("* " + image.public_id);
                                console.log("* " + image.url);
                                console.log("* " + image.secure_url);
                            }
                            avatar = image.secure_url;
                            data.avatar = avatar;
                            if(config.testingData){
                                console.log(`Avatar:${avatar}`);
                                console.log(`New Avatar field:${data.avatar}`);
                                console.log('Body stringifyed');
                                console.log(JSON.stringify(data, null, 4));
                            }
                            fs.unlink(req.file.path, resultHandler); //erase the file from server.
                            //now we may continue with the update as usual. we should update right here is the image arrived
                            // in order to process as soon as we have the new image uploaded.
                            User.findOneAndUpdate({ username: decoded.usernameHive }, data, {new: true}, function(err, user){
                                if(err) return res.status(500).send("There was a problem updating the user.");
                                res.status(200).send(user);
                                console.log(`Updated User on DB. \n username:${user.username} \n time:${time}`);
                            });
                        });
                    }else{
                        if(config.testingData){
                            console.log('No file from client.');
                        }
                        //now we update as usual
                        //TODO -> remove NRY adding as function on functions sections for any function that repeats in this module
                        // or make a function module and import it here on top
                        User.findOneAndUpdate({ username: decoded.usernameHive }, data, {new: true}, function(err, user){
                            if(err) return res.status(500).send("There was a problem updating the user.");
                            res.status(200).send(user);
                            console.log(`Updated User on DB. \n username:${user.username} \n time:${time}`);
                        });
                    };
                });
            }else{
                return res.status(500).send({ auth: false, message: 'Error authenticating token POST user update.' });
            }
        });
    }

    // var token = req.headers['x-access-token'];
    // if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    // jwt.verify(token, config.secret, function(err, decoded){
    //     if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    //     if(decoded){
    //         upload(req, res, function (err) {
    //             if (err) {
    //               console.log('Err',err); // A Multer error occurred when uploading.
    //             }
    //             res.status(200).send(res);
    //         });
    //     }else{
    //         return res.status(500).send({ auth: false, message: 'Error authenticating token PUT user.' });
    //     }
    // });
});
////////---> end testing with post

router.put('/update/:username', function(req, res){
    console.log(req);
    //check for a valid token first
    var token = req.headers['x-access-token'];
    // console.log('Token', token);
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //here we should take the imageFile
            //for now just check if the image file is comming as it should + upload to server
            upload(req, res, function (err) {
                if (err) {
                  console.log('Err',err); // A Multer error occurred when uploading.
                }
                res.status(200).send(res);
                // cloudinary.uploader.upload(req.file.path, { tags: 'testBE'}, function(err, image){
                //   if (err) { console.warn(err); }
                //       if(config.testingData === "true"){
                //           console.log("* public_id for the uploaded image is generated by Cloudinary's service.");
                //           console.log("* " + image.public_id);
                //           console.log("* " + image.url);
                //       }
                //   res.status(200).send(image); //now send data backto user for now
                //   fs.unlink(req.file.path, resultHandler); //erase the file from server.
                // });
            });
            ///END TESTING PART

            // User.findOneAndUpdate({ username: decoded.usernameHive }, req.body, {new: true}, function(err, user){
            //     if(err) return res.status(500).send("There was a problem updating the user.");
            //     res.status(200).send(user);
            //     console.log(`Updated User on DB. \n username:${user.username} \n time:${time}`);
            // });
        }else{
            return res.status(500).send({ auth: false, message: 'Error authenticating token PUT user.' });
        }
    });
});

// Methods to handle following field [String]
// 1. Get following data from a user. but it serves at get a field from user.
router.get('/jabUserField', function(req,res){
    const token = req.headers['x-access-token'];
    const jsonQuery = JSON.parse(req.headers['query']); //as query = { field: "fieldToGet"}
    // TODO validate in case of empty query -> return 404 Funny message.
    console.log('Querying on field.', query);
    //{ item: 1, fieldToGet: 1 }
    const newNode = {};
    Object.entries(jsonQuery).forEach(([key, val]) => {
        if(val !== null && val !== ""){
            return (newNode[val] = 1);
        }
    });
    console.log('To execute as projection field:',newNode);
    const projection = { item: 1, newNode: newNode};
    console.log('So the final project is:',projection);

    // if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    // jwt.verify(token, config.secret, function(err, decoded){
    //     if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    //     if(decoded){
    //         User.findOne( { username: decoded.usernameHive }, { item: 1, field:1}, function(err, found){

    //         });
    //     }else{
    //         return res.status(500).send({ auth: false, message: 'Error authenticating token PUT user.' });
    //     }
    // });
});

// router.post('/',function(req,res){
//     User.create({
//             name: req.body.name,
//             email: req.body.email,
//             password: req.body.password,
//         },
//         function(err, user){
//             if (err) return res.status(500).send('There was a problem trying to add data into DB');
//             res.status(200).send(user);
//             console.log(`Created User on DB. \n name:${user.name} \n id:${user.id}`);
//         }
//     );
// });
// returns all users in DB

///////////////////////////////////////////////////////////////////
//Just admin functions
router.get('/', function(req, res){
    const time = new Date();
    // TODO verify token present on headers
    var token = req.headers['x-access-token'];
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //if decoded properly, we get the username of the "admin". Then we check in DB if that user is really usertype = admin.
            User.findOne({ username: decoded.usernameHive }, function(err, user){
                if(err) return res.status(500).send("There was a problem finding the user -xx.");
                if(user){
                    //it exists at least. now check if his usertype === admin
                    if(user.usertype === "admin"){
                        //the user is an admin so we may process finding all the data he asked
                        console.log('Welcome Admin!');
                        //now we may search all users and find the result
                        User.find({}, function(err, users){
                            if(err) return res.status(500).send('There was a problem finding the users.');
                            if(config.testingData){
                                console.log('Admin looked Up all users in DB.', time);
                            };
                            res.status(200).send(users);
                        });
                    }else{
                        //no admin so send error
                        console.log('F.O you are not an admin!');
                        return res.status(500).send({ auth: false, message: 'Error authenticating "admin" user.' });
                    }
                }else{
                    //
                    return res.status(500).send({ auth: false, message: 'Error no user found on that credentials.' });
                }
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Error authenticating token PUT user.' });
        }
    });
});
//get user's logs
router.get('/logs', function(req, res){
    const time = new Date();
    // TODO verify token present on headers
    var token = req.headers['x-access-token'];
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            //if decoded properly, we get the username of the "admin". Then we check in DB if that user is really usertype = admin.
            User.findOne({ username: decoded.usernameHive }, function(err, user){
                if(err) return res.status(500).send("There was a problem finding the user -xx.");
                if(user){
                    //it exists at least. now check if his usertype === admin
                    if(user.usertype === "admin"){
                        //the user is an admin so we may process finding all the data he asked
                        //now we may search all users and find the result
                        Logs.find({}, function(err, logs){
                            if(err) return res.status(500).send('There was a problem finding the logs.');
                            if(config.testingData){
                                console.log('Hi there Admin!');
                                console.log('Admin looked Up all users logs in DB.', time);
                            };
                            res.status(200).send(logs);
                        });
                    }else{
                        //no admin so send error
                        if(config.testingData){
                            console.log('F.O you are not an admin! Go code.');
                        }
                        return res.status(500).send({ auth: false, message: 'Error authenticating "admin" user.' });
                    }
                }else{
                    //
                    return res.status(500).send({ auth: false, message: 'Error no user found on that credentials.' });
                }
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Error authenticating token GET logs.' });
        }
    });
});
///////////////////////////////////////////////////////////////////////


// get a single user from DB
// router.get('/:id', function(req, res){
//     if(checkId(req.params.id.toString())){
//         User.findById(req.params.id, function(err, user){
//             if(err) return res.status(500).send("There was a problem finding the user." + "\n" + err);
//             if (!user) return res.status(404).send("No user found.");
//             res.status(200).send(user);
//             console.log(`Searched User on DB. \n name:${user.name} \n id:${user.id}`);
//         });
//     }else {
//         console.log("A wrong ID formatted query was trying to reach the server's DB");
//         return res.status(404).send("Id format is not as required. Please use correct one!");
//     }
// })

// deletes a user from DB
// router.delete('/:id', function(req, res){
//     if(checkId(req.params.id.toString())){
//         User.findByIdAndRemove(req.params.id, function(err, user){
//             if(err) return res.status(500).send("There was a problem deleting the user");
//             res.status(200).send("User " + user.name + " was deleted.");
//             console.log(`Deleted User on DB. \n name:${user.name} \n id:${user.id}`);
//         });
//     }else {
//         console.log("A wrong ID formatted query was trying to reach the server's DB");
//         return res.status(404).send("Id format is not as required. Please use correct one!");
//     }
// });

// updates a single user in DB
// router.put('/:id', function(req, res){
//     if(checkId(req.params.id.toString())){
//         User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, user){
//             if(err) return res.status(500).send("There was a problem updating the user.");
//             res.status(200).send(user);
//             console.log(`Updated User on DB. \n name:${user.name} \n id:${user.id}`);
//         });
//     }else {
//         console.log("A wrong ID formatted query was trying to reach the server's DB");
//         return res.status(404).send("Id format is not as required. Please use correct one!");
//     }
// });

module.exports = router;
