const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const tokenBlacklist = require('../models/blacklist.model');
/**
 * @name registerUserController
 * @desc Register a new user, expects name, email, and password in the request body. Returns a success message upon successful registration.
 * @access Public
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body;
    if(!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email, and password' });
    }
    const isUserExists = await userModel.findOne({
        $or: [{ username }, { email }]
    });
    if (isUserExists) {
        /* isUserExists will be true if either the username or email already exists in the database. In that case, we return a 400 status code with a message indicating that the username or email already exists. */
        return res.status(400).json({ message: 'Username or Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ username, email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
});
    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, username: user.username, email: user.email }});
}
/**
 * @name loginUserController
 * @desc Login an existing user, expects email and password in the request body. Returns a success message and a JWT token upon successful login.
 * @access Public
 */
async function loginUserController(req, res) {
    const {email, password } = req.body;
    const user = await userModel.findOne({ email});
    if(!user){
        return res.status(400).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(400).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
});
    res.status(200).json({ message: 'Login successful', user: { id: user._id, username: user.username, email: user.email }});
}
/**
 * @name logoutUserController
 * @desc Logout a user by blacklisting the JWT token, expects the token in the request body. Returns a success message upon successful logout.
 * @access Public
 */
async function logoutUserController(req, res) {
    const  token = req.cookies.token;
    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }
    await tokenBlacklist.create({ token });
    res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
});
    res.status(200).json({ message: 'Logout successful' });
}
/**
 * @name getMeController
 * @desc Get the currently logged-in user's information
 * @access Private
 */
async function getMeController(req, res) {
   const user = await userModel.findById(req.user.userId).select('-password');
   res.status(200).json({ user });
}

module.exports = { registerUserController, loginUserController,logoutUserController, getMeController };