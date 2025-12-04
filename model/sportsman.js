const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const achievementsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Yutuq nomi kiritilishi shart"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    year: {
      type: Number,
      min: 1940,
      max: new Date().getFullYear() + 1,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true, _id: true }
);

const sportsmanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    surname: { type: String, required: true, trim: true, minlength: 2 },
    birthDate: {
      type: Date,
      required: [true, "Tug'ilgan sana kiritilishi shart"],
    },
    phone: {
      type: String,
      match: /^\+998\d{9}$/,
      sparse: true,
      unique: true,
    },

    sportType: {
      type: String,
      required: true,
      enum: [
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
    },

    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coach",
      required: true,
    },

    height: { type: Number, required: true, min: 100, max: 230 },
    weight: { type: Number, required: true, min: 30, max: 200 },

    achievements: {
      type: [achievementsSchema],
      validate: [
        (v) => v.length <= 50,
        "Yutuqlar soni 50 tadan oshmasligi kerak",
      ],
      default: [],
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
      chronicDiseases: { type: [String], default: [] },
      lastMedicalCheck: Date,
    },

    isActive: { type: Boolean, default: true, select: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// === INDEXES ===
sportsmanSchema.index({ coach: 1 });
sportsmanSchema.index({ sportType: 1 });
sportsmanSchema.index({ createdAt: -1 });
sportsmanSchema.index({ "achievements.year": -1 });

// === VIRTUAL ===
sportsmanSchema.virtual("age").get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - this.birthDate.getFullYear();
  const m = today.getMonth() - this.birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.birthDate.getDate())) age--;
  return age;
});

// === METHOD ===
sportsmanSchema.methods.getPublicProfile = function () {
  const obj = this.toObject();
  delete obj.isActive;
  delete obj.medicalInfo; // oddiy odam ko‘rmasin
  delete obj.__v;
  return obj;
};

// === PRE SAVE → Coach bilan bog‘lash (lekin transaction bilan emas, chunki MongoDB 4.0+ kerak emas) ===
sportsmanSchema.pre("save", async function (next) {
  if (this.isModified("coach") || this.isNew) {
    const Coach = mongoose.model("Coach");
    const coach = await Coach.findOne({ _id: this.coach, isActive: true });

    if (!coach) {
      return next(new AppError("Murabbiy topilmadi yoki faol emas", 400));
    }
  }
  next();
});

// Agar coach o‘zgarsa → eski coachdan o‘chirish
sportsmanSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.coach) {
    const sportsman = await this.model.findOne(this.getQuery());
    if (sportsman && !sportsman.coach.equals(update.coach)) {
      await mongoose.model("Coach").updateOne(
        { _id: sportsman.coach },
        { $pull: { sportsmen: sportsman._id } } // esda qolsin: Coach modelida sportsmen emas, sportsmen!
      );
    }
  }
  next();
});

module.exports = mongoose.model("Sportsman", sportsmanSchema);
