var express = require('express');
var app = express();
var cors = require('cors')
var db = require('./db');
const config = require('./config');
// const fileupload = require('express-fileupload')
//use cors
app.use( cors() );
//authorization End Point/Controller

if(config.testingData === 'true'){
    console.log(`Auth Route:${config.authRouteEP}`);
    console.log(`User Access:${config.userEP}`);
    console.log(`Admin Access:${config.adminEP}`);
    console.log(`Job Access:${config.jobEP}`);
}
var Authcontroller = require('./Authcontroller');
app.use(config.authRouteEP, Authcontroller);

//user definitions
var UserController = require('./UserController.js');
app.use(config.userEP, UserController);
//notifications
var NotiController = require('./NotiController.js');
app.use(config.notiEP, NotiController);
//logs
var LogsController = require('./Logscontroller.js');
app.use(config.adminEP, LogsController);
//admins operations: Ban, update, etc.
//logs
var AdminsController = require('./Admincontroller.js');
app.use(config.adminEP, AdminsController);
//jobs
var JobController = require('./Jobcontroller.js');
app.use(config.jobEP, JobController);
// //jobs
var JobController = require('./Jobcontroller.js');
app.use(config.adminEP, JobController);

module.exports = app;

// // testing using curl locally
// curl -v http://localhost:3000/?name=JohnLopez