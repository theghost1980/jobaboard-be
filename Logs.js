var mongoose = require('mongoose');
var LogsSchema = new mongoose.Schema({
    is_system: Boolean,
    log_type: String, //as 'login', 'logout', 'support', 'marketplace',
    action: String, //if needed as 'buy','sell','edit','query'
    note: String, //to use if user banned or extra note.
    txID: String,
    op: String,
    totalSteps: String, //just used to follow up the nft creation amd other processes that involve steps.
    result: String,
    error: String,
    descError: String,
    data: String,// if needed we can store stringified data here.
    username: String,
    usertype: String,
    ipaddress: String,
    createdAt: Date,
    event: String,
});
//later on we could add more fields, depending on needs. I.e: logginmethod as 'HS' or 'KCH'.
mongoose.model('Logs',LogsSchema);

module.exports = mongoose.model('Logs');