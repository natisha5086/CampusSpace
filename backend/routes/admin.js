const express = require("express");
const User = require("../models/User");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

// Admin dashboard statistics
router.get("/dashboard", async (req, res, next) => {
    try {
        const users = await User.countDocuments();
        const rooms = await Room.countDocuments({ isActive: true });
        const bookings = await Booking.countDocuments({
            status: "confirmed"
        });

        res.json({
            statistics: {
                totalUsers: users,
                totalRooms: rooms,
                activeBookings: bookings
            }
        });

    } catch (error) {
        next(error);
    }
});

// Change user role
router.patch("/users/:id/role", async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!["student", "faculty", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role." });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: "Role updated.", user });

    } catch (error) {
        next(error);
    }
});

module.exports = router;