const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: [true, 'Username Already Taken']
    },
    email: {
        type: String,
        required: true,
        unique: [true, 'Email Already Registered']
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);