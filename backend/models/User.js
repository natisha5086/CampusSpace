const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ["student", "faculty", "admin"],
        default: "student"
    },
    studentId: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);