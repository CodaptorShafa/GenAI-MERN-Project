const mongoose = require('mongoose');


const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'Token is required to be added in the blacklist']
    }
   
},{ timestamps: true

})
const tokenBlacklist = mongoose.model('TokenBlacklist', blacklistSchema);
module.exports = tokenBlacklist;