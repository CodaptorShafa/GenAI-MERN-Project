
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectToDB = require("./config/database");

const app = express();

const allowedOrigins = [
    "https://gen-ai-mern-project-frontend.vercel.app",
    "http://localhost:5173",
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests without an Origin header.
        if (!origin) {
            return callback(null, true);
        }

        // Allow the stable frontend domain and matching Vercel previews.
        const isVercelDeployment =
            /^https:\/\/gen-ai-mern-project-frontend(?:-[a-z0-9-]+)?-shafaullah-siddiqui\.vercel\.app$/.test(
                origin
            );

        if (
            allowedOrigins.includes(origin) ||
            origin === process.env.FRONTEND_URL ||
            isVercelDeployment
        ) {
            return callback(null, true);
        }

        console.error("CORS blocked origin:", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

// CORS must run before your API routes.
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Connect to the database before processing requests.
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

// API routes
const authRoutes = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.route");

app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRouter);

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        message: "GenAI API is running",
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        message: "Internal server error",
    });
});

module.exports = app;
