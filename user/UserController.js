var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./User');

//////////
//check if valid Id object first
function checkId(id){
    return (id.match(/^[0-9a-fA-F]{24}$/)) ? true : false;
}
//end stric checks
//////////

router.post('/',function(req,res){
    User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        },
        function(err, user){
            if (err) return res.status(500).send('There was a problem trying to add data into DB');
            res.status(200).send(user);
            console.log(`Created User on DB. \n name:${user.name} \n id:${user.id}`);
        }
    );
});
// returns all users in DB
router.get('/', function(req, res){
    User.find({}, function(err, users){
        if(err) return res.status(500).send('There was a problem finding the users.');
        res.status(200).send(users);
        console.log('Users looked Up on DB.');
    });
});

// get a single user from DB
router.get('/:id', function(req, res){
    if(checkId(req.params.id.toString())){
        User.findById(req.params.id, function(err, user){
            if(err) return res.status(500).send("There was a problem finding the user." + "\n" + err);
            if (!user) return res.status(404).send("No user found.");
            res.status(200).send(user);
            console.log(`Searched User on DB. \n name:${user.name} \n id:${user.id}`);
        });
    }else {
        console.log("A wrong ID formatted query was trying to reach the server's DB");
        return res.status(404).send("Id format is not as required. Please use correct one!");
    }
})
// deletes a user from DB
router.delete('/:id', function(req, res){
    if(checkId(req.params.id.toString())){
        User.findByIdAndRemove(req.params.id, function(err, user){
            if(err) return res.status(500).send("There was a problem deleting the user");
            res.status(200).send("User " + user.name + " was deleted.");
            console.log(`Deleted User on DB. \n name:${user.name} \n id:${user.id}`);
        });
    }else {
        console.log("A wrong ID formatted query was trying to reach the server's DB");
        return res.status(404).send("Id format is not as required. Please use correct one!");
    }
});
// updates a single user in DB
router.put('/:id', function(req, res){
    if(checkId(req.params.id.toString())){
        User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, user){
            if(err) return res.status(500).send("There was a problem updating the user.");
            res.status(200).send(user);
            console.log(`Updated User on DB. \n name:${user.name} \n id:${user.id}`);
        });
    }else {
        console.log("A wrong ID formatted query was trying to reach the server's DB");
        return res.status(404).send("Id format is not as required. Please use correct one!");
    }
});
module.exports = router;
