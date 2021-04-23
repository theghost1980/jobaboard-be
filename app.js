var express = require('express');
var app = express();
var cors = require('cors')
var db = require('./db');
const config = require('./config');
// const fileupload = require('express-fileupload')
//use cors
app.use(cors());
//authorization End Point/Controller

if(config.testingData === 'true'){
    console.log(`Auth Route:${config.authRouteEP}`);
    console.log(`User Access:${config.userEP}`);
    console.log(`Admin Access:${config.adminEP}`);
    console.log(`Job Access:${config.jobEP}`);
    console.log(`NFT operations on HIVE chain - Access:${config.nft_EP}`);
    console.log(`NFT mongoDB access:${config.handleNFTEP}`);
    console.log(`Portfolio Access:${config.portfolioEP}`);
    console.log(`Public Access:${config.publicEP}`);
    console.log(`Order Access:${config.ordersEP}`);
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
// TODO fix this and is better to add a route just for admins on admin and not to mix.
var JobController = require('./Jobcontroller.js');
app.use(config.adminEP, JobController);
// Portfolio route
var PortfolioController = require('./Portfoliocontroller');
app.use(config.portfolioEP,PortfolioController);

// testing SSC 
var SSCController = require('./TestSSC');
app.use(config.nft_EP, SSCController);

//adding public routes
var PublicController = require('./Publiccontroller');
app.use(config.publicEP, PublicController);

//NFT handling on MongoDB
var NFTController = require('./Nftcontroller');
app.use(config.handleNFTEP, NFTController);

//Orders handling EP
const OrderController = require('./OrderController');
app.use(config.ordersEP, OrderController);

module.exports = app;

// // testing using curl locally
// curl -v http://localhost:3000/?name=JohnLopez