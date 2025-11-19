const mongoose = require("mongoose");
const User = require("./user");

const achievementsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Yutuq kiritilishi shart"],
      trim: true,
    },
    year: { type: Number, min: 1900, max: new Date().getFullYear() },
  },
  { _id: false }
);

const sportsmanSchema = new mongoose.Schema({
  sportType: {
    type: String,
    required: [true, "Sport turi kiritilishi shart"],
    trim: true,
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coach",
    required: [true, "Murabbiy ID si kiritilishi shart"],
  },
  height: {
    type: Number,
    min: [30, "Vazn 30 kg dan kam bulmasligi kerak"],
    max: [150, "Vazn 150 kg dan kop bulmasligi kerak"],
    required: [true, "Vazn kiritilishi shart"],
  },
  weight: {
    type: Number,
    min: [100, "Boyninggiz 100 sm dan kam bulmasligi kerak"],
    max: [200, "Boyninggiz 200 sm dan baland bulmasligi kerak"],
    required: [true, "Boy uzunligi kiritilishi shart"],
  },
  achievements: [achievementsSchema],
});

const Sportsman = User.discriminator("Sportsman", sportsmanSchema);

sportsmanSchema.pre("save", async function (doc) {
  const Coach = require("./coach");
  await Coach.findByIdAndUpdate(doc.coach, {
    $addToSet: { sportsman: doc._id },
  });
});

module.exports = Sportsman;
