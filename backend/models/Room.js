const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true
    },
    building: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    floor: {
        type: String,
        default: ""
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    roomType: {
        type: String,
        default: "Lecture Hall"
    },
    facilities: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);