const mongoose = require("mongoose");
const User = require("./user");

const coachSchema = new mongoose.Schema({
  experience: {
    type: Number,
    required: [true, "Tajriba yillari kiritilishi shart"],
    min: [1, "Tariba yili 1 yildan kam bulmasligi kerak"],
  },
  specialization: {
    type: String,
    required: [true, "Ixtisos kiritilishi shart"],
  },
  sportsman: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sportsman",
    },
  ],
});

const Coach = User.discriminator("Coach", coachSchema);

module.exports = Coach;
