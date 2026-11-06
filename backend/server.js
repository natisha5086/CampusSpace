require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDatabase = require("./config/database");

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN
        ? process.env.CLIENT_ORIGIN.split(",")
        : true
}));

app.use(express.json());

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300
}));

app.get("/", (req, res) => {
    res.json({
        name: "CampusSpace API",
        status: "Running"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        service: "CampusSpace"
    });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/admin", require("./routes/admin"));

app.use((req, res) => {
    res.status(404).json({ message: "API route not found." });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: "Internal server error."
    });
});

const PORT = process.env.PORT || 5000;

connectDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`CampusSpace API running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    });