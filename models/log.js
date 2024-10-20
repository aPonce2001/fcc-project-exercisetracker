const mongoose = require('mongoose');

const logSchema = mongoose.Schema({
    username: String,
    count: Number,
    log: [{
        description: String,
        duration: Number,
        date: String
    }]
}, { versionKey: false });

module.exports = mongoose.model('Log', logSchema);
