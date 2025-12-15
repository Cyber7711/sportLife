const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

parentSchema.index({ user: 1 });

parentSchema.virtual("sportsmanChildren", {
  ref: "Sportsman",
  localField: "user",
  foreignField: "parent",
});

const Parent = mongoose.model("Parent", parentSchema);
