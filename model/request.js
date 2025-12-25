const mongoose = require("mongoose");
const requestSchema = new mongoose.Schema({
  sportsman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Caoch",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  message: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Request", requestSchema);
