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
      validate: {
        function(val) {
          return val <= new Date().getFullYear() + 1;
        },
        message: "Yil kelajakdagi juda uzoq  sana bulishi mumkin emas",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const sportsmanSchema = new mongoose.Schema(
  {
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

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coach",
      required: [true, "Murabbiy Tanlanishi kerak"],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

sportsmanSchema.pre("save", async function (next) {
  if (this.isModified("coach")) {
    const Coach = mongoose.models.Coach || mongoose.model("Coach");
    const haveCoach = await Coach.findOne({ _id: this.coach, isActive: true });
    if (!haveCoach)
      return next(new AppError("Murabbiy topilmadi yoki faol emas", 400));
  }

  if (this.parent && this.isModified("parent")) {
    const User = mongoose.models.User || mongoose.model("User");
    const haveParent = await User.findOne({ _id: this.parent, isActive: true });
    if (!haveParent)
      return next(
        new AppError("Ota-ona (Parent) topilmadi yoki faol emas", 400)
      );
  }
});

sportsmanSchema.index({ coach: 1 });
sportsmanSchema.index({ sportType: 1 });
sportsmanSchema.index({ createdAt: -1 });
sportsmanSchema.index({ "achievements.year": -1 });

sportsmanSchema.methods.getPublicProfile = function () {
  const obj = this.toObject();
  delete obj.isActive;
  delete obj.medicalInfo;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("Sportsman", sportsmanSchema);
