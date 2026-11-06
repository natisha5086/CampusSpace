const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function createToken(user) {
    return jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

function safeUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId
    };
}

// Register student
router.post("/register", async (req, res, next) => {
    try {
        const { name, email, password, studentId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email: normalizedEmail,
            passwordHash,
            studentId: studentId || "",
            role: "student"
        });

        res.status(201).json({
            message: "Registration successful.",
            token: createToken(user),
            user: safeUser(user)
        });

    } catch (error) {
        next(error);
    }
});

// Login
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+passwordHash");

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        res.json({
            message: "Login successful.",
            token: createToken(user),
            user: safeUser(user)
        });

    } catch (error) {
        next(error);
    }
});

// Get logged-in user
router.get("/me", requireAuth, (req, res) => {
    res.json({
        user: safeUser(req.user)
    });
});

module.exports = router;