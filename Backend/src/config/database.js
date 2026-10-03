const mongoose = require("mongoose");

async function connectToDB() {
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected To Database");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
}

module.exports = connectToDB;