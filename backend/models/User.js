const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ["Admin", "Student", "Advisor"], required: true },
  milestones: [{ type: mongoose.Schema.Types.ObjectId, ref: "Milestone" }],
});

module.exports = mongoose.model("User", userSchema);
