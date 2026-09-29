const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  credentials: true, // Allow cookies to be sent
}));
/*Required Routes*/
const authRoutes = require('./routes/auth.routes');
/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
app.use('/api/auth', authRoutes);
module.exports = app;