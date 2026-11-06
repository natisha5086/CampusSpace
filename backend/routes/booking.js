const express = require("express");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Create booking
router.post("/", requireAuth, async (req, res, next) => {
    try {
        const { roomId, purpose, date, startTime, endTime } = req.body;

        if (!roomId || !purpose || !date || !startTime || !endTime) {
            return res.status(400).json({
                message: "Please provide all booking details."
            });
        }

        if (startTime >= endTime) {
            return res.status(400).json({
                message: "End time must be later than start time."
            });
        }

        const room = await Room.findOne({
            _id: roomId,
            isActive: true
        });

        if (!room) {
            return res.status(404).json({ message: "Room not found." });
        }

        const conflict = await Booking.findOne({
            room: roomId,
            date,
            status: "confirmed",
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        });

        if (conflict) {
            return res.status(409).json({
                message: "Room already booked. Please choose another time or room."
            });
        }

        const booking = await Booking.create({
            room: roomId,
            user: req.user._id,
            purpose,
            date,
            startTime,
            endTime
        });

        res.status(201).json({
            message: "Booking successful!",
            booking
        });

    } catch (error) {
        next(error);
    }
});

// User booking history
router.get("/my", requireAuth, async (req, res, next) => {
    try {
        const bookings = await Booking.find({
            user: req.user._id
        })
        .populate("room")
        .sort({ createdAt: -1 });

        res.json({ bookings });
    } catch (error) {
        next(error);
    }
});

// All bookings for faculty/admin
router.get("/", requireAuth, requireRole("admin", "faculty"), async (req, res, next) => {
    try {
        const bookings = await Booking.find()
            .populate("room")
            .populate("user", "name email")
            .sort({ date: 1, startTime: 1 });

        res.json({ bookings });
    } catch (error) {
        next(error);
    }
});

// Cancel booking
router.patch("/:id/cancel", requireAuth, async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }

        const owner = booking.user.toString() === req.user._id.toString();

        if (!owner && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        booking.status = "cancelled";
        await booking.save();

        res.json({ message: "Booking cancelled.", booking });

    } catch (error) {
        next(error);
    }
});

module.exports = router;