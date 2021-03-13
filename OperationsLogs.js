var mongoose = require('mongoose');
var OPLogsSchema = new mongoose.Schema({
    txID: String,
    op: String,
    totalSteps: String,
    result: String,
    error: String,
    descError: String,
});
//later on we could add more fields, depending on needs. I.e: logginmethod as 'HS' or 'KCH'.
mongoose.model('OpLogs',OPLogsSchema);

module.exports = mongoose.model('OpLogs');