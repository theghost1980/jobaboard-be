var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded( { extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');
//dhive
const { Client, Signature, cryptoUtils } = require("@hiveio/dhive");
const client = new Client("https://api.hive.blog");

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

//new tests based on data from client-gatsby
router.post('/checkGatsbySig', async function(req, res){
    if(config.testingData){
        console.log('A request has been made! -testing mode-');
    }
    const time = new Date();
    const { signature, account } = req.body;
    try {
        Signature.fromString(signature).recover(cryptoUtils.sha256(config.moreSecret)).toString();
    } catch (error) {
        //possible the signature do not have same lenght/corrupted/wrong data
        console.log(error);
        return res.status(500).send({ auth: false, message: 'Signature provided wrong format!!!.' });
    }
    //to do a try-catch that handle if this is a valid sig or somehow check if valid before getting into this point
    const dataRemote = Signature.fromString(signature).recover(cryptoUtils.sha256(config.moreSecret)).toString();
    // console.log(`Dataremote: ${dataRemote}`);
    client.database.getAccounts([`${account}`])
    .then(results => {
        console.log(`Found: ${results.length}`);
        if(results.length > 0){ //we found one record
            const postingAccount = results[0].posting;
            const key = postingAccount.key_auths[0].find(item => item === dataRemote);
            // console.log(key);
            if(key){
                // as founded send user's profile pic from hive just in case there is none in mongoDB
                const JSON_metadata = JSON.parse(results[0].posting_json_metadata);
                const profile_PicURL = JSON_metadata.profile.profile_image || 'noPicSet';
                //expires in 12 hrs
                var token = jwt.sign({ usernameHive: account }, 
                    config.secret, { expiresIn: 43200 });
                console.log(`Received at:\n${time}`);
                console.log(`User:${account}, auth:True.`);
                //test to set the token on headers
                let RES = res.set('Authorization', `Bearer ${token}`);
                RES.set('ExpiresIn','12h');
                return RES.status(200).send({ auth: true, token: token, message: 'Access Granted!', profile_PicURL: profile_PicURL });
                // return res.status(200).send({ auth: true, token: token, message: 'Access Granted...Finally!' });
            }else{
                //signature failed test, maybe corrupted or altered but with same lenght
                console.log(`Received at:\n${time}`);
                console.log(`User:${account}, auth:False.\nReason: Signature provided failed authentication!!!.`);
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

    // console.log(`Result:${result}, message:${message}`);
    // if(result == 200){//generate JWT token and send it back.
    //     //expires in 12 hrs
    //     var token = jwt.sign({ mail: user.email }, 
    //         config.secret, { expiresIn: 43200 });
    //     const time = new Date();
    //     console.log(`Received at:\n${time}`);
    //     console.log(`User:${account}, auth:True.`);
    //     return res.status(200).send({ auth: true, token: token, message: message });
    // } else {
    //     const time = new Date();
    //     console.log(`Received at:\n${time}`);
    //     console.log(`User:${account}, auth:False.\nReason:${message}`);
    //     return res.status(404).send({ auth: false, message: message });
    // }
    // return res.status(200).send({ message: 'Received Biatch Keep the good work'});
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