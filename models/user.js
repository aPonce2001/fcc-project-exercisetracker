const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: String
}, { versionKey: false });

module.exports = mongoose.model('User', userSchema);
