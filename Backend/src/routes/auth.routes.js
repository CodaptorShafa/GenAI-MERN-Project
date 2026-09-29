const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticateToken = require('../middlewares/auth.middleware');
/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.registerUserController);
/**
 * @route POST /api/auth/login
 * @desc Login an existing user
 * @access Public
 */
router.post('/login', authController.loginUserController);
/**
 * @route GET /api/auth/logout
 * @desc Logout a user by blacklisting the JWT token
 * @access Public
 */
router.get('/logout', authenticateToken, authController.logoutUserController);
/**
 * @route GET /api/auth/get-me
 * @desc Get the currently logged-in user's information
 * @access Private
 */
router.get('/get-me', authenticateToken, authController.getMeController);
module.exports = router;