require('dotenv').config();
var app = require('./app');
// console.log(`port:${process.env.PORT}`);
var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});
