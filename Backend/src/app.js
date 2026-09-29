const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.json());
app.use(cookieParser());
/*Required Routes*/
const authRoutes = require('./routes/auth.routes');
/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
app.use('/api/auth', authRoutes);
module.exports = app;