// db.js
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  language: String,
  code: String,
  output: String,
  status: String, // Accepted, Wrong Answer, Runtime Error, Compilation Error, Time Limit Exceeded
  problemTitle: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  details: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const Submission = mongoose.model("Submission", submissionSchema);
const User = mongoose.model("User", userSchema);

module.exports = { Submission, User };
