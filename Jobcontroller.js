var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Job = require('./Job');
var jwt = require('jsonwebtoken');
var config = require('./config');
const time = new Date();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//+++++++++++++++++++++++++++++++++++++++++++++++
///////////////////////////////////////////////////////////////////////////////
//////////Whole process to upload image(s) from client/////////////////////////
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
const upload = multer({ storage: storage }).array("file");
const uploadSingle = multer({ storage: storage }).single("file");
//////to delete the file after sending it to cloud
const fs = require('fs');
let resultHandler = function (err) {
    if (err) {
        console.log("unlink failed", err);
    } else {
        console.log("file deleted");
    }
}
////////////////////////////////////////////////////////////////////
// const cloudinaryUpload = file => cloudinary.uploader.upload(file);
router.post('/createJob', async function(req,res){
    const time = new Date();
    const token = req.headers['x-access-token'];
    if(!token) return res.status(404).send({auth: false, message: 'No token provided!'});
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({auth: false,message: 'Failed to authenticate token.'});
        if(!decoded) res.status(500).send({auth: false, message: 'Invalid token.'}); //invalid token
        else if(decoded){
            // then search for this user jobs by the title comming. req.headers['title']
            const title = req.headers['title'];
            console.log(`trying to find:${title}`);
            //so we search to be sure than this user has no other job with same title.
            Job.findOne({ title: title, username: decoded.usernameHive },function(err,found){
                if(err){ //return res.status(500).send({ 'status': 'failed request -job Search', 'error': err });
                    console.log('Error on search.',err);
                }
                if(!found){
                    //cloudinary loop depending if at least one image to upload to server.
                    upload(req, res, function (err) {
                        if (err) {console.log('Err',err);}
                        let res_promises = req.files.map(file => new Promise((resolve,reject) => {
                            cloudinary.uploader.upload(file.path,{ tags: 'testMultiple'}, function(err, image){
                                if(err) reject(err) 
                                else {
                                    resolve(image.secure_url);
                                    fs.unlink(file.path, resultHandler);
                                }
                            })
                        })
                        )
                        Promise.all(res_promises)
                        .then(result => { //result is the array holding the images as we need them.
                            var data = {};
                            data = req.body;
                            data.images = [...result]; //we should have the array if any now we create.
                            if(config.testingData){
                                console.log(result);
                                console.log('To save:');
                                console.log(data);
                            }
                            Job.create(data,function(err,job){
                                if(err) return res.status(500).send({ 'status': 'failed', 'message': err });
                                if(job){
                                    //job was created...al went well plug&pray
                                    if(config.testingData){ console.log(`Job created.\nDateTime:${time}.\nTitle:${job.title}\nId:${job.id}.`)};
                                    console.log('Sending to client:');
                                    console.log(job);
                                    return res.status(200).send({ 'status': 'success', 'data': job});
                                }
                            });
                        })
                        .catch((error) => { res.status(400).send({'status': 'failed', 'message': error})});
                    });
                    //END cloudinary loop
                }else if(found){
                    if(config.testingData){ console.log('Job found on that title.')}
                    return res.status(200).send({'status': 'failed', 'message': 'job already exists with that title.'});
                }
            });
        }
    });
});

///update/edit a job
router.post('/updateJob', function(req,res){
    const token = req.headers['x-access-token'];
    const job_id = req.headers['job_id'];
    if(!job_id) return res.status(404).send({status: 'failed', message: 'No Job_ID provided!'});  
    if(!token) return res.status(404).send({auth: false, message: 'No token provided!'});
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({auth: false,message: 'Failed to authenticate token.'});
        if(!decoded) res.status(500).send({auth: false, message: 'Invalid token.'}); //invalid token
        else if(decoded){
            uploadSingle(req, res, function (err) {
                //TODO later as an update when project approved and released add the image editor so the user can modify the images on the job as they want.
                if(err){
                    if(config.testingData){ console.log('Error Multer.', err )};
                    return res.status(500).send({ status: 'failed', message: err });
                }
                const data = req.body;
                if(config.testingData){ 
                    console.log('About to update On Job_id:', job_id);
                    console.log('About to update data:', data);
                };
                Job.findByIdAndUpdate(job_id, data, { new: true }, function(err, updated){
                    if(err){
                        if(config.testingData){ console.log('Error updating Job.', err)};
                        return res.status(500).send({ status: 'failed', message: err });
                    }
                    return res.status(200).send({ status: 'sucess', message: `Job id:${updated._id} Updated Successfully. You can make more great Gigs and services.`, result: updated });
                });
            });
        }
    });
})
///END update/edit a job

/////get job title on a user - just that.
router.get('/myjoblist',function(req,res){
    const time = new Date();
    const token = req.headers['x-access-token'];
    if(!token) return res.status(404).send({auth: false, message: 'No token provided!'});
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({auth: false,message: 'Failed to authenticate token.'});
        if(!decoded) res.status(500).send({auth: false, message: 'Invalid token.'}); //invalid token
        else if(decoded){
            //bring all jobs of this user.
            Job.find({ username: decoded.usernameHive }, function(err, jobs){
                if(err) {console.log('Error finding jobs',err)}
                if(!jobs) return res.status(200).send({ result: []});
                if(jobs) return res.status(200).send({ result: jobs});
            });
        }
    });
});

// TODO: set this a a public router just to handle all the OPEN queries.
////PUBLIC ROUTES....
//get all job PUBLIC query
// TODO add the sort option as asc = 1 || desc = -1 + field to sortBy.
router.get('/publicAllJobs',function(req,res){
    const time = new Date();
    Job.find({ active: true }, function(err, jobs){
        if(err) {console.log('Error finding jobs',err)}
        if(!jobs) return res.status(200).send({ result: []});
        if(jobs) return res.status(200).send({ result: jobs});
    }).sort( { createdAt: -1 })
    if(config.testingData){
        console.log('Public request made asking for ALL JOBS');
        console.log(time);
    }
});
router.get('/publicAllJobsQuery',function(req,res){
    const time = new Date();
    const query = JSON.parse(req.headers['query']);
    const limit = Number(req.headers['limit']) || 0; //just in case no number comes from request.
    if(config.testingData){
        console.log('query to find on all jobs:');
        console.log(query);
    }
    Job.find({ ...query }, function(err, jobs){
        if(err) {console.log('Error finding jobs',err)}
        if(!jobs) return res.status(200).send({ result: []});
        if(jobs) return res.status(200).send({ result: jobs});
    }).sort( { createdAt: -1 }).limit(limit)
    if(config.testingData){
        console.log('Public request made asking for ALL JOBS');
        console.log(time);
    }
});
////END PUBLIC ROUTES....

/////////////////////////
//Route for Job
//Get jobs by username
router.get('/:username', function(req, res){
    //check for a valid token
    var token = req.headers['x-access-token'];
    if(!token) return res.status(404).send({ auth: false, message: 'No token provided!' });
    jwt.verify(token, config.secret, function(err, decoded){
        if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        if(decoded){
            // console.log(decoded);

            //search jobs under this username
            Job.find({ username: decoded.usernameHive }, function (err, docs) {
                if(err) return res.status(500).send("There was a problem finding the user's Jobs." + "\n" + err);
                if(!docs || docs.length <= 0) return res.status(404).send({ message: "No jobs for this user" });
                res.status(200).send(docs);
                if(config.testingData){
                    console.log('Token', token);
                    console.log(`Searched Jobs on DB. \n name:${decoded.usernameHive} \n Time:${time}`);
                    console.log('Jobs Found:',docs);
                }
            });
        }else{
            return res.status(500).send({ auth: false, message: 'Error authenticating token GET Jobs.' });
        }
    });
});

module.exports = router;
