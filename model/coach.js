const mongoose = require("mongoose");
const validator = require("validator");
const User = require("./user");
const Sportsman = require("./sportsman");

const coachSchema = new mongoose.Schema(
  {
    experience: {
      type: Number,
      required: [true, "Murabbiy tajribasi (yillarda) kiritilishi shart"],
      min: [0, "Tajriba 0 yildan kam bo‘lmasligi kerak"],
      max: [60, "Tajriba 60 yildan ortiq bo‘lmasligi kerak"],
      validate: {
        validator: Number.isInteger,
        message: "Tajriba butun son bo‘lishi kerak",
      },
    },

    specialization: {
      type: String,
      required: [true, "Ixtisoslashuv kiritilishi shart"],
      trim: true,
      minlength: [5, "Ixtisos juda qisqa"],
      maxlength: [100, "Ixtisos juda uzun"],
    },

    sportTypes: [
      {
        type: String,
        required: true,
        enum: [
          "Futbol",
          "Basketbol",
          "Voleybol",
          "Boks",
          "Kurash",
          "Dzyudo",
          "Taekvondo",
          "Og'ir atletika",
          "Yengil atletika",
          "Suzish",
          "Tenis",
          "Stol tennisi",
          "Karate",
          "Sambo",
        ],
      },
    ],

    sportsman: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sportsman",
      },
    ],

    license: {
      number: { type: String, trim: true, uppercase: true, sparse: true },
      issuedBy: { type: String, trim: true },
      issuedDate: Date,
      expiryDate: Date,
      isValid: { type: Boolean, default: true },
    },

    // Reyting
    rating: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },

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

    bio: { type: String, trim: true, maxlength: 1000 },

    achievements: [
      {
        title: { type: String, required: true, trim: true },
        year: { type: Number, min: 1950, max: new Date().getFullYear() + 1 },
        description: { type: String, trim: true },
        _id: false,
      },
    ],

    contact: {
      phone: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || validator.isMobilePhone(v, "uz-UZ");
          },
          message:
            "Telefon raqami to‘g‘ri formatda bo‘lishi kerak (+998 xx xxx xx xx)",
        },
      },
      telegram: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

coachSchema.index({ "license.number": 1 }, { unique: true, sparse: true });
coachSchema.index({ sportTypes: 1 });
coachSchema.index({ isActive: 1 });
coachSchema.index({ experience: -1 });
coachSchema.index({ "rating.average": -1 });

coachSchema.virtual("totalSportsman").get(function () {
  return this.sportsman?.length || 0;
});

coachSchema.virtual("age").get(function () {
  if (!this.user?.birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - this.user.birthDate.getFullYear();
  const m = today.getMonth() - this.user.birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.user.birthDate.getDate()))
    age--;
  return age;
});

coachSchema.pre(/^find/, function (next) {
  if (!this.getQuery().skipIsActiveFilter) {
    this.find({ isActive: { $ne: false } });
  } else {
    delete this._conditions.skipIsActiveFilter;
  }
  next();
});

coachSchema.pre("save", function (next) {
  if (this.license?.expiryDate && new Date() > this.license.expiryDate) {
    this.license.isValid = false;
  }
  next();
});

coachSchema.methods.getPublicProfile = function (isAdminRequest = false) {
  const coach = this.toObject();
  delete coach.isActive;
  delete coach.license;
  delete coach.__v;

  if (coach.contact?.phone && !isAdminRequest) {
    coach.contact.phone = coach.contact.phone.replace(
      /(\d{3})\d{6}(\d{2})/,
      "$1******$2"
    );
  }

  return coach;
};

const Coach = mongoose.model("Coach", coachSchema);
module.exports = Coach;
