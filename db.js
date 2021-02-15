require('dotenv').config();
var mongoose = require('mongoose');
//options for db connection
const options = {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false,
};
mongoose.connect(process.env.DB_URI, options)
    .then(() => {
        console.log('Connected to DB on Mongo Atlas.');
        console.log(`Mongoose says: ${mongoose.connection.readyState}`);
        console.log(`DB name:${mongoose.connection.db.databaseName}`);
        // console.log(`Collections Available:`);
        // console.log(mongoose.connection.db.listCollections({},{ nameOnly: true }));
    })
    .catch(err => {
        console.log('Db connection error=======');
        console.log(err);
        //optional
        alert('Terminator Server!');
        process.exit(1); //force to terminate the program.
    })