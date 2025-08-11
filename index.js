const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const { generateFile } = require("./generateFile");
const { runOnce, prepareExecution } = require("./executeCode");
const { Submission, User } = require("./db");
const authMiddleware = require("./middlewares/authMiddleware");

// Load env vars
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL || "*";
const PORT = process.env.PORT || 3000;
const MAX_OUTPUT_CHARS = 10000;

// Ensure folders exist
const dirCodes = path.join(__dirname, "codes");
const outputsDir = path.join(__dirname, "outputs");
if (!fs.existsSync(dirCodes)) fs.mkdirSync(dirCodes, { recursive: true });
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

// Connect to MongoDB
mongoose.connect(MONGO_URI)

  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

const app = express();

// CORS: Allow frontend URL for deployed version
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Online Compiler / OJ is running...");
});

/* ==== SIGNUP ==== */
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword });
    res.json({ message: "Signup successful", userId: newUser._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ==== LOGIN ==== */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ... rest of your existing code for /submissions, /run, etc.

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
