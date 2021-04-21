var mongoose = require('mongoose');
var LogsSchema = new mongoose.Schema({
    is_system: Boolean,
    log_type: String,//as 'admin'
    username: String,
    usertype: String,
    ipaddress: String,
    createdAt: Date,
    event: String,
});
//later on we could add more fields, depending on needs. I.e: logginmethod as 'HS' or 'KCH'.
mongoose.model('Logs',LogsSchema);

module.exports = mongoose.model('Logs');