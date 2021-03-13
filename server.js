require('dotenv').config();
var app = require('./App');
var port = process.env.PORT || 3000;
// console.log(`port:${process.env.PORT}`);
if(process.env.testing_data === 'true'){
    console.log('========TEST MODE ACTIVE - WARNING======')
    console.log('Welcome to the JobAboard API server. v.0.1');
    console.log('========================================')
}
app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});

// to check live logs errors on terminal:
// heroku logs --tail --app backendjab