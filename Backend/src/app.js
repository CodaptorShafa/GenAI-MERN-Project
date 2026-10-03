const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectToDB = require("./config/database");

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigin =
    process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
    cors({
        origin: allowedOrigin,
        credentials: true,
    })
);

/*
|--------------------------------------------------------------------------
| Database Connection
|--------------------------------------------------------------------------
*/

app.use(async (req, res, next) => {
    try {
        await connectToDB();
        next();
    } catch (error) {
        console.error("Database connection failed:", error);

        res.status(500).json({
            message: "Database connection failed",
        });
    }
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

const authRoutes = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.route");

app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRouter);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
    res.status(200).json({
        message: "GenAI API is running",
    });
});

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        message: "Internal server error",
    });
});

module.exports = app;