const mongoose = require("mongoose");
const User = require("./user");

const coachSchema = new mongoose.Schema(
  {
    experience: {
      type: Number,
      required: [true, "Tajriba yillari kiritilishi shart"],
      min: [1, "Tariba yili 1 yildan kam bulmasligi kerak"],
      max: [50, "Tajriba yili 50 yildan kop bulmasligi kerak"],
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
  },
  { timestamps: true }
);

coachSchema.pre("save", function (next) {
  console.log(`Coach ${this.id} saqlandi`);
  next();
});

coachSchema.index({ sportsman: 1 });

const Coach = User.discriminator("Coach", coachSchema);

module.exports = Coach;
