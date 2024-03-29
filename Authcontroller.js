var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded( { extended: false }));
router.use(bodyParser.json());
var User = require('./User');
var Logs = require('./Logs');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('./config');
//dhive
const { Client, Signature, cryptoUtils } = require('@hiveio/dhive');
const client = new Client(config.apiHive);

//from now on, at the top of each controller, if needed, the handling function to create the logs.
function saveLog(from_req,is_system=false, log_type='',action='',note='', txID='',op='',totalSteps='',result='',error='',descError='',data='',username='',usertype='',ipaddress='',createdAt='',event=''){
    // is_system: Boolean,
    // log_type: String, //as 'login', 'logout', 'support', 'marketplace', 'operation'
    // action: String, //if needed as 'buy','sell','edit','query'
    const log = { is_system: is_system,log_type: log_type, action: action, note: note, txID: txID,op: op,totalSteps: totalSteps, result: result,error: error,descError: descError,data: data,username: username,usertype: usertype,ipaddress: ipaddress,createdAt: createdAt,event: event,};
    const logCleaned = {};
    Object.entries(log).forEach(([key,value]) => {
        if(value !== '' && value !== null && value !== undefined){ logCleaned[key]= value; };
    });
    Logs.create(logCleaned, function(err, log){
        if(err){ 
            console.log('Error trying to add new Log on DB!', err);
            if(config.testingData){ console.log('Error saving this log:', logCleaned )};
        }
        if(from_req){ return res.status(200).send({ status: 'sucess', result: log })};
        }
    );
}

// TODO: Check with the tutorial too see if the code match or there is an eror related to the password checks/assignments.

//la logica como yo lo entiendo:
// 1er filtro.
//(todo esto sucede despues de haber hecho login en hive-keychain/hivesigner)
//3 posibles peticiones: 1- register(a new user) 2-login 3-logOut(pero supongo podemos dejarlo como opcional ya que cada token muere segun el tiempo establecido),
//1 - Register:
// 1.1 check if email(or the field we want to set as main on DB) exists
// 1.2 if exists, return a "User already in DB, please use a different email".
// 1.3 if not exists, register en DB
//  1.3.1 crear un hash segun el campo(email en este caso) y guardar: email, hash, date_creation, user_type, profile_pic, etc.
    // 1.3.2 crear token segun mail(que en este caso seria el campo unico), enviar token + user_type.
// 2.1 Login
    // 2.1.1 Check

//route to authentication endpoint
// router.post('/register', function(req, res) {

//     //check to be sure this users do not exists on DB
//     User.findOne(({ mail: req.body.email }), function(err, user){
//         if(err) return res.status(500).send('There was a problem looking into DB');
//         if(user){
//             return res.status(404).send('Email already registered. Please check!');
//         } else {
//             var hashedEmail = bcrypt.hashSync(req.body.email,10);
//             const dateTime = new Date();
//             User.create({
//                 name: req.body.name,
//                 email: req.body.email,
//                 registered: dateTime,
//                 hash: hashedEmail,
//             },
//             function (err, user){
//                 if (err) return res.status(500).send("There was a problem registering the user.")
//                 //create a token
//                 var token = jwt.sign(
//                     { email: user.email }, //payload
//                     config.secret, // key to sign the payload
//                     { expiresIn: 43200 } //expires in 12 hrs
//                 ); //it returns a token
//                 const dateTime = new Date();
//                 res.status(200).send({ auth: true, token: token });
//                 console.log(`User Registered. \nToken:${token}\nAuto-createdDB:${user._id}\n${user.email}\nhash:${hashedEmail}`);
//                 console.log(`DateTime:${dateTime}`);
//             });
//         }
//     });
// });

// get the user id based on the token we got
// router.get('/me', function(req, res){
//     var token = req.headers['x-access-token'];
//     if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
//     jwt.verify(token, config.secret, function(err, decoded){
//         if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
//         //initial decoding without verifying
//         // res.status(200).send(decoded);
//         console.log(`Decoded found:${decoded.email}`)
//         //now checking if the user's id exists to match and authorize it
//         User.findOne({ email: decoded.email }, 
//             function(err, user){
//                 if(err) return res.status(500).send("There was a problem finding the user. Please check!");
//                 if(!user) return res.status(404).send("No user found!!!");
//                 // res.status(200).send(user);
//                 res.status(200).send({ auth: true, token: token, authLevel: 'user' });
//                 const dateTime = new Date();
//                 console.log(`User Autheticated Token ${user._id} \n AuthLevel: TODO`);
//                 console.log(`DateTime:${dateTime}`);
//         });
//     });
// });

//find user and validate - login process
// router.post('/login', function(req, res){
    
//     User.findOne({ email: req.body.email }, function(err, user){
//         if(err) return res.status(500).send("Error on server while login a user.");
//         if(!user) return res.status(404).send('No user was found. Please check!');

//         var mailIsvalid = bcrypt.compareSync(req.body.email, user.hash);
//         if(!mailIsvalid) return res.status(401).send({ auth: false, token: null});

//         var token = jwt.sign(
//             { mail: user.email }, 
//             config.secret, 
//             { expiresIn: 43200 }, //expires in 12 hrs.
//         );

//         res.status(200).send({ auth: true, token: token });
//         const dateTime = new Date();
//         //maybe here we could register on activity id + datetime maybe
//         //TODO
//         console.log(`User Logged In user:${user.email} \n ${user._id}`);
//         console.log(`DateTime:${dateTime}`);
//     });
// });


//check active token and valid one
//find user who is already logged in, anytime a new request is being made,
// i.e. check profile, save data or create contracts.
router.post('/checkUser',function(req, res){
    var token = req.headers['x-access-token'];
    if(!token) return res.status(404).send({auth: false, message: 'No token provided!'});
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({auth: false,message: 'Failed to authenticate token.'});
        if(!decoded) res.status(500).send({auth: false, message: 'Invalid token.'}); //invalid token
        return res.status(500).send({auth: true, message: 'Still valid token.'}); //good  token
    });
});

//TODO very important on user's login.
// We must check if the user has image from hive.
// if does, take that image(somehow) and create a thumb. Add those new 2 images on mongoDB and upload them to cloudinary.
//new tests based on data from client-gatsby
router.post('/checkGatsbySig', async function(req, res){
    //dummy image if user not have profileImg set
    var profile_PicURL = "https://res.cloudinary.com/dbcugb6j4/image/upload/v1614450740/dummy-profilePic_ogyaoc.png";
    const ts = req.headers['ts'];
    const login_method = "hive_key_chain";
    if(config.testingData === 'true'){
        console.log('A request AUTH/keychain has been made! -testing mode-');
        console.log(`ts:${ts}`);
    }
    var userT = 'user';
    var banned = false;
    const time = new Date();

    // ----------------------editing, testing to remove-------------------------
    //OLD WAY without using the ts
    // const { signature, account } = req.body;
    // try {
    //     Signature.fromString(signature).recover(cryptoUtils.sha256(config.moreSecret)).toString();
    // } catch (error) {
    //     //possible the signature do not have same lenght/corrupted/wrong data
    //     console.log(error);
    //     return res.status(500).send({ auth: false, message: 'Signature provided wrong format!!!.' });
    // }
    // end old way
    //to do a try-catch that handle if this is a valid sig or somehow check if valid before getting into this point
    // const dataRemote = Signature.fromString(signature).recover(cryptoUtils.sha256(config.moreSecret)).toString();
    //NEW WAY testing today 19/03/2021

    // TODO HERE imporant
    // Using cludinary to upload an image from URL, we will get the users image from hive on first login
    // create the new url + thumb an set that info into mongoDB
    const { signature, account } = req.body;
    try {
        Signature.fromString(signature).recover(cryptoUtils.sha256(ts)).toString();
    } catch (error) {
        //possible the signature do not have same lenght/corrupted/wrong data
        console.log(error);
        return res.status(500).send({ auth: false, message: 'Signature provided wrong format!!!.' });
    }
    // end new way
    //to do a try-catch that handle if this is a valid sig or somehow check if valid before getting into this point
    const dataRemote = Signature.fromString(signature).recover(cryptoUtils.sha256(ts)).toString();
    // ----------------------editing, testing to remove-------------------------
    if(config.testingData){ console.log(`Dataremote: ${dataRemote}`); }
    client.database.getAccounts([`${account}`])
    .then(results => {
        // console.log(`Found: ${results.length}`);
        if(results.length > 0){ //we found one record
            // console.log(results[0]);
            const postingAccount = results[0].posting;
            // console.log(results[0].posting);
            // console.log(dataRemote);
            const key = postingAccount.key_auths[0].find(item => item === dataRemote);
            // console.log(key);
            if(key){
                // as founded send user's profile pic from hive just in case there is none in mongoDB
                //one case to test if the profile is brand new it wont have profile image
                // console.log('Actual Profile Found from HIVE chain::::');
                // console.log(results[0]);
                //if the account is brandnew .posting_json_metadata = '' so let's verify that first
                if(config.testingData){ console.log(results[0]); }
                //now I should check if there is any profile pic on user.s hive profile
                try {
                    //try to parse the posting_json_metadata if error then is brand new or not image set
                    //the account has been used to it may have profile picture already set
                    const JSON_metadata = JSON.parse(results[0].posting_json_metadata);
                    if(config.testingData){ console.log(JSON_metadata); }
                    if(JSON_metadata.profile.profile_image){
                        profile_PicURL = JSON_metadata.profile.profile_image;
                        }
                    } catch (error) {
                        console.log('Brand new user or not image set on profile.');
                        console.log(`Selected temporary image as:\n${profile_PicURL}`)
                    }
                // var profile_PicURL = JSON_metadata.profile.profile_image || 'noPicSet';
                //expires in 6 hrs
                var token = jwt.sign({ usernameHive: account }, 
                    config.secret, { expiresIn: 21600 });
                //test to set the token on headers
                let RES = res.set('Authorization', `Bearer ${token}`);
                RES.set('ExpiresIn','6h');
                User.findOne({ username: account },function(err, usr){
                    if(err){
                        console.log('There was a problem finding the user on DB');
                        console.log(err);
                    };
                    if(!usr){
                        if(config.testingData){ console.log('User not found on DB, creating a new one.'); }
                        User.create({ username: account, pk: key, avatar: profile_PicURL, usertype: 'user', createdAt: time, }, function(err, user){
                                if(err){ console.log('Error trying to add new user on DB!', err);}
                                if(user){
                                    console.log(`Created User on DB. \nname:${user.username} \ntype:${user.usertype} \nTime:${time}`);
                                    userT = user.usertype;
                                    banned = user.banned;
                                    saveLog(false, false,'log_in','first_time_log_in',banned,'','','',`login_method:${login_method}`,'','','',account,userT,req.ip,time,'');
                                    return RES.status(200).send({ auth: true, token: token, message: 'Access Granted!', profile_PicURL: profile_PicURL, usertype: userT, banned: banned, });
                                } 
                            }
                        );
                    }else if(usr){
                        if(config.testingData) { console.log('User found:',usr.username);
                            console.log('User type:',usr.usertype);
                        };
                        userT = usr.usertype;
                        banned = usr.banned;
                        if(usr.avatar){
                            //user has picture so assign it
                            console.log('User has avatar on mongoDB!');
                            profile_PicURL = usr.avatar;
                        }
                    }
                    //if found returns it foto profile, if not present send hive profilePICurl
                    //if not found register as new on db.
                    //create log
                    saveLog(false, false,'log_in','none',banned,'','','',`login_method:${login_method}`,'','','',account,userT,req.ip,time,'');
                    if(config.testingData === 'true'){ console.log(`Received at:\n${time}\nUser:${account}, auth:True.\nType:${userT}\nCreate Log - Login event. Registered)`);}
                    return RES.status(200).send({   auth: true, token: token, message: 'Access Granted!', profile_PicURL: profile_PicURL, usertype: userT, banned: banned, });
                });
                // return res.status(200).send({ auth: true, token: token, message: 'Access Granted...Finally!' });
            }else{
                //signature failed test, maybe corrupted or altered but with same lenght
                if(config.testingData === 'true'){
                    console.log(`Received at:\n${time}`);
                    console.log(`User:${account}, auth:False.\nReason: Signature provided failed authentication!!!.`);
                }
                return res.status(500).send({ auth: false, message: 'Signature provided failed authentication!!!.' });
            }
        }else{//no user found on API DB Hive
            //user fo not exists on hive chain.
            return res.status(500).send({ auth: false, message: 'Failed to Find this user on DB.' });
        }
    })
    .catch(error => {
        console.log('Error trying to fetch API Hive node.');
        console.log(error);
        return res.status(404).send({ auth: false, message: 'Error trying to fetch API Hive node.' });
    })
});

//When user log in using Hivesigner
router.post('/checkGatsbySig2', async function(req, res){
    if(config.testingData === 'true'){ console.log('A request AUTH/hivesign has been made! -testing mode-') };
    const login_method = 'hive_signer';
    var userT = 'user';
    const time = new Date();
    const { account } = req.body;
    var token = jwt.sign({ usernameHive: account }, config.secret, { expiresIn: 21600 });
    let RES = res.set('Authorization', `Bearer ${token}`); //set the token on headers
    RES.set('ExpiresIn','6h');
    User.findOne({ username: account },function(err, usr){
        if(err){ console.log('There was a problem finding the user on DB', err);};
        if(!usr){
            console.log('User not found on DB, create it');
            User.create({ username: account, pk: '', avatar: '', usertype: 'user', createdAt: time, }, function(err, user){
                    if(err){ console.log('Error trying to add new user on DB!', err); };
                    if(user){
                        console.log(`Created User on DB. \nname:${user.username} \ntype:${user.usertype} \nTime:${time}`);
                        userT = user.usertype;
                        saveLog(false, false,'log_in','first_time_log_in','','','','',`login_method:${login_method}`,'','','',account,user.usertype,req.ip,time,'');
                        return RES.status(200).send({ auth: true, token: token, message: 'Access Granted!', profile_PicURL: usr.avatar, usertype: userT, });
                    } 
                }
            );
        }else if(usr){
            console.log('User found:',usr.username);
            console.log('User type:',usr.usertype);
            userT = usr.usertype;
        }
        if(config.testingData === 'true'){
            console.log(`Received at:\n${time}`);
            console.log(`User:${account}, auth:True.\nType:${userT}`);
        }
        saveLog(false, false,'log_in','','','','','',`login_method:${login_method}`,'','','',usr.username,userT,req.ip,time,'');
        return RES.status(200).send({   auth: true, token: token, message: 'Access Granted!', profile_PicURL: usr.avatar, usertype: userT, });
    });
});

/////////////////////
// special functions
// async function verifyMsg(msgReceived,accountReceived){
//     const starWars = process.env.StarWars;
//     try {
//         const dataRemote = Signature.fromString(msgReceived).recover(cryptoUtils.sha256(starWars)).toString();
//         const client = new Client("https://api.hive.blog");
//         client.database.getAccounts([`${accountReceived}`])
//         .then(results => {
//             console.log(`Found: ${results.length}`);
//             if(results.length > 0){
//                 const postingAccount = results[0].posting;
//                 const key = postingAccount.key_auths[0].find(item => item === dataRemote);
//                 if(key){
//                     //now we can emit the jwt token.
//                     // TODO HERE
//                     return { result: 200, message: 'Welcome User!'};
//                 }else{
//                     //signature failed test, maybe corrupted or altered but with same lenght
//                     return { result: 404, message: 'Signature provided failed authentication!!!.'};
//                 }
//             } else {
//                 //user fo not exists on hive chain.
//                 return { result: 404, message: 'Failed to Find this user on DB.'};
//             }
//         }).catch(error => {
//             //error while trying to fetch data with hive API.
//             console.log('Error while trying to get Data from user');
//             console.log(error);
//             return { result: 404, message: 'Failed to Find this user on DB.'};
//         })   
//     } catch (error) {
//         //signature or account altered return 500
//         return { result: 404, message: 'Failed to Authenticate. Wrong Data!'};
//     }
// }
//end special functions
///////////////////////

module.exports = router;