require('dotenv').config();
var app = require('./app');
// console.log(`port:${process.env.PORT}`);
if(process.env.testing_data){
    console.log('Welcome to the Back End Hive API server. v.0.1');
}
var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});

// to check live logs errors on terminal:
// heroku logs --tail --app backendjab