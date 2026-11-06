const mongoose = require("mongoose");

async function connectDatabase() {
    if (!process.env.MONGODB_URI) {
        throw new Error("MongoDB connection string is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");
}

module.exports = connectDatabase;