var express = require('express');
var app = express();
var cors = require('cors')
var db = require('./db');
const config = require('./config');
//use cors
app.use(cors());
//authorization End Point/Controller
var authcontroller = require('./auth/authcontroller');
if(config.testingData){
    console.log(`Auth Route:${config.authRouteEP}`);
    console.log(`User Access:${config.userEP}`);
}
app.use(config.authRouteEP, authcontroller);

//user definitions
// var UserController = require('./user/UserController');
// app.use(config.userEP, UserController);
module.exports = app;

// // testing using curl locally
// curl -v http://localhost:3000/?name=JohnLopez