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

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const MAX_OUTPUT_CHARS = 10000;

const dirCodes = path.join(__dirname, "codes");
const outputsDir = path.join(__dirname, "outputs");
if (!fs.existsSync(dirCodes)) fs.mkdirSync(dirCodes, { recursive: true });
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

mongoose.connect("mongodb://localhost:27017/onlineCompilerDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Online Compiler / OJ is running...");
});

/* Signup */
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

/* Login */
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

/* Unified submissions GET endpoint with auth */
app.get("/submissions", authMiddleware, async (req, res) => {
  try {
    // userId can be passed as query param or fallback to logged in user
    const userId = req.query.userId || req.user._id.toString();
    const limit = parseInt(req.query.limit, 10) || 0;

    // Optional: If userId passed is not logged-in user, check if exists
    if (req.query.userId && req.query.userId !== req.user._id.toString()) {
      const userExists = await User.exists({ _id: userId });
      if (!userExists) return res.status(404).json({ error: "User not found" });
    }

    let query = Submission.find({ userId }).sort({ createdAt: -1 });
    if (limit > 0) query = query.limit(limit);

    const submissions = await query.exec();

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Run Code */
app.post("/run", authMiddleware, async (req, res) => {
  let { language, code, input, problemTitle } = req.body;
  if (!language || !code) return res.status(400).json({ error: "language and code required" });

  language = language.trim().toLowerCase();
  try {
    const { filePath, meta } = generateFile(language, code);
    const prep = await prepareExecution(language, filePath, meta, 5000);

    if (prep.compileError) {
      const sub = await Submission.create({
        language,
        code,
        output: prep.compileError,
        userId: req.user._id,
        status: "Compilation Error",
        problemTitle: problemTitle || null,
        details: { compileError: prep.compileError }
      });
      cleanupFilesSafe([filePath, ...prep.cleanupFiles]);
      return res.json({ error: "Compilation Error", compileError: prep.compileError, submission: sub });
    }

    const runRes = await runOnce(prep.runCommand, prep.runArgs, input || "", 2000, MAX_OUTPUT_CHARS);

    let output = (runRes.stdout || "") + (runRes.stderr ? ("\n[stderr]\n" + runRes.stderr) : "");
    if (output.length > MAX_OUTPUT_CHARS) output = output.slice(0, MAX_OUTPUT_CHARS) + "\n...[truncated]";

    const status = runRes.timedOut
      ? "Time Limit Exceeded"
      : (runRes.exitCode !== 0 ? "Runtime Error" : "Accepted");

    const sub = await Submission.create({
      language,
      code,
      output,
      userId: req.user._id,
      status,
      problemTitle: problemTitle || null,
      details: { timeMs: runRes.timeMs, exitCode: runRes.exitCode, signal: runRes.signal }
    });

    cleanupFilesSafe([filePath, ...prep.cleanupFiles]);
    return res.json({ output, status, timeMs: runRes.timeMs, submission: sub });
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
});

/* Dashboard summary */
app.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("username");
    if (!user) return res.status(404).json({ error: "User not found" });

    const allSubs = await Submission.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const totalSubmissions = allSubs.length;
    const acceptedCount = allSubs.filter(s => (s.status || "").toLowerCase() === "accepted").length;
    const wrongCount = allSubs.filter(s => (s.status || "").toLowerCase() === "wrong answer").length;
    const runtimeErrorCount = allSubs.filter(s => (s.status || "").toLowerCase() === "runtime error").length;
    const compilationErrorCount = allSubs.filter(s => (s.status || "").toLowerCase() === "compilation error").length;
    const tleCount = allSubs.filter(s => (s.status || "").toLowerCase() === "time limit exceeded").length;

    const last5 = allSubs.slice(0, 5);

    let rating = acceptedCount * 10
      - wrongCount * 2
      - runtimeErrorCount * 1
      - compilationErrorCount * 1
      - tleCount * 3;

    if (rating < 0) rating = 0;
    const successRate = totalSubmissions === 0 ? 0 : Math.round((acceptedCount / totalSubmissions) * 100);

    res.json({
      username: user.username,
      totalSubmissions,
      acceptedCount,
      successRate,
      rating,
      recentSubmissions: last5,
      summary: {
        accepted: acceptedCount,
        wrongAnswer: wrongCount,
        runtimeError: runtimeErrorCount,
        compilationError: compilationErrorCount,
        timeLimitExceeded: tleCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Profile Route */
app.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("username email");
    if (!user) return res.status(404).json({ error: "User not found" });

    let email = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.id === userId) email = user.email;
      } catch { /* ignore invalid token */ }
    }

    const submissions = await Submission.find({ userId }).sort({ createdAt: -1 });

    res.json({
      user: { username: user.username, email },
      submissions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Cleanup Helper */
function cleanupFilesSafe(files = []) {
  try {
    files.forEach(f => {
      if (!f) return;
      try {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      } catch {}
    });
  } catch (e) {
    console.error("cleanup error", e);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
