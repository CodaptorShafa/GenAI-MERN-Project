const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const tokenBlacklist = require('../models/blacklist.model');

 async function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const isBlacklisted = await tokenBlacklist.findOne({ token });
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Access denied. Token is blacklisted.' });
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
        return res.status(400).json({ message: 'Invalid token.' });
    }
}
module.exports = authenticateToken;