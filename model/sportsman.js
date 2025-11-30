const mongoose = require("mongoose");
const User = require("./user");
const Coach = require("./coach");
const AppError = require("../utils/appError");

const achievementsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Yutuq kiritilishi shart"],
      trim: true,
    },
    year: {
      type: Number,
      min: [1900, "Yutuq yili 1900-yildan past bulmasligi kerak"],
      max: new Date().getFullYear(),
    },
  },
  { _id: false }
);

const sportsmanSchema = new mongoose.Schema(
  {
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
    weight: {
      type: Number,
      min: [30, "Vazn 30 kg dan kam bulmasligi kerak"],
      max: [150, "Vazn 150 kg dan kop bulmasligi kerak"],
      required: [true, "Vazn kiritilishi shart"],
    },
    height: {
      type: Number,
      min: [100, "Boyninggiz 100 sm dan kam bulmasligi kerak"],
      max: [200, "Boyninggiz 200 sm dan baland bulmasligi kerak"],
      required: [true, "Boy uzunligi kiritilishi shart"],
    },
    achievements: [achievementsSchema],
  },
  { timestamps: true }
);

sportsmanSchema.pre("save", async function () {
  const coach = await Coach.findByIdAndUpdate(
    this.coach,
    {
      $addToSet: { sportsman: this._id },
    },
    { new: true }
  );
  if (!coach) {
    throw new AppError("Murabbiy topilmadi yoki mavjud emas");
  }
});

const Sportsman = User.discriminator("Sportsman", sportsmanSchema);

module.exports = Sportsman;
