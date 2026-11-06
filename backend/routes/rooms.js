const express = require("express");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Search rooms
router.get("/", async (req, res, next) => {
    try {
        const filter = { isActive: true };

        if (req.query.building) {
            filter.building = new RegExp(req.query.building, "i");
        }

        if (req.query.capacity) {
            filter.capacity = { $gte: Number(req.query.capacity) };
        }

        const rooms = await Room.find(filter).sort({ building: 1, name: 1 });
        res.json({ rooms });
    } catch (error) {
        next(error);
    }
});

// Check room availability
router.get("/:id/availability", async (req, res, next) => {
    try {
        const { date, startTime, endTime } = req.query;

        if (!date || !startTime || !endTime || startTime >= endTime) {
            return res.status(400).json({ message: "Invalid booking time." });
        }

        const conflict = await Booking.findOne({
            room: req.params.id,
            date,
            status: "confirmed",
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        });

        res.json({ available: !conflict });
    } catch (error) {
        next(error);
    }
});

// Add room (admin only)
router.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json({ room });
    } catch (error) {
        next(error);
    }
});

module.exports = router;