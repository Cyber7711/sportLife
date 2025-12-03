const mongoose = require("mongoose");
const Coach = require("./coach");
const AppError = require("../utils/appError");

const achievementsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Yutuq nomi kiritilishi shart"],
      trim: true,
      minlength: [3, "Yutuq nomi 3 sozdan kam bulmasligi kerak"],
      maxlength: [100, "Yutuq nomi 100 ta sozdan kop bulmasligi kerak"],
    },
    year: {
      type: Number,
      min: [1900, "Yutuq yili 1900-yildan past bulmasligi kerak"],
      max: [
        new Date().getFullYear() + 1,
        "Kelajak yutuqlari hali kiritilmaydi",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Tavsif 500 belgidan oshmasligi kerak"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false, timestamps: true }
);

const sportsmanSchema = new mongoose.Schema(
  {
    sportType: {
      type: String,
      required: [true, "Sport turi kiritilishi shart"],
      trim: true,
      enum: {
        values: [
          "Futbol",
          "Basketbol",
          "Voleybol",
          "Boks",
          "Kurash",
          "Taekvondo",
          "Sambo",
          "Og'ir atletika",
          "Yengil atletika",
          "Suzish",
          "Tenis",
          "Stol tennisi",
          "Dzyudo",
          "Karate",
        ],
        message: (props) => `Bunday Sport turi mavjud emas: ${props.value} `,
      },
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coach",
      required: [true, "Murabbiy ID si kiritilishi shart"],
      validate: {
        validator: async function (coachId) {
          const coach = await mongoose.model("Coach").findById(coachId);
          return coach != null && coach && coach.isActive === true;
        },
        message: "Tanlangan murabbiy faol emas yoki mavjud emas",
      },
    },
    weight: {
      type: Number,
      min: [30, "Vazn 30 kg dan kam bulmasligi kerak"],
      max: [
        200,
        "Vazn 200 kg dan kop bulmasligi kerak (agar ogir atliktika bulsa ham)",
      ],
      required: [true, "Vazn kiritilishi shart"],
      validate: {
        validator: (v) => Number.isFinite(v) && v > 0,
        message: "Vazn togri raqam bulishi kerak",
      },
    },
    height: {
      type: Number,
      min: [100, "Boyninggiz 100 sm dan kam bulmasligi kerak"],
      max: [230, "Boyninggiz 230 sm dan baland bulishi odatiy emas"],
      required: [true, "Boy uzunligi kiritilishi shart"],
    },
    achievements: {
      type: [achievementsSchema],
      validate: {
        validator: (v) => v.length <= 50,
        message: "Yutuqlar soni 50 tadan oshmasligi kerak",
      },
    },
    category: {
      type: String,
      enum: ["Yoshlar", "Kattalar", "Veteran", "Professional", "Amateur"],
      default: "Yoshlar",
    },
    medicalInfo: {
      bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },
      allergies: { type: [String], default: [] },
      chronicDiseases: [String],
      lastMedicalCheck: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    birthDate: {
      type: Date,
    },
  },

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

sportsmanSchema.index({ coach: 1 }), sportsmanSchema.index({ sportType: 1 });
sportsmanSchema.index({ "achievements.year": -1 });
sportsmanSchema.index({ createdAt: -1 });

sportsmanSchema.virtual("age").get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - this.birthDate.getFullYear();
  const m = today.getMonth() - this.birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.birthDate.getDate())) {
    age--;
  }
  return age;
});

sportsmanSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("coach")) {
    try {
      if (!this.isNew) {
        const old = await this.constructor.findById(this._id).select("coach");
        if (old && old.coach && !old.coach.equals(this.coach)) {
          await Coach.updateOne(
            { _id: old.coach },
            { $pull: { sportsman: this._id } }
          );
        }
      }

      const result = await Coach.updateOne(
        { _id: this.coach, isActive: true },
        { $addToSet: { sportsman: this._id } }
      );

      if (result.matchedCount === 0) {
        return next(new AppError("Murabbiy topilmadi yoki faol emas", 400));
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

sportsmanSchema.methods.getPublicProfile = function (isAdmin = false) {
  const profile = this.toObject();
  delete profile.isActive;
  delete profile.__v;
  if (!this.isAdmin) {
    delete profile.medicalInfo;
  }
  return profile;
};

const Sportsman = mongoose
  .model("User")
  .discriminator("Sportsman", sportsmanSchema);

module.exports = Sportsman;
