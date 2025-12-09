const mongoose = require("mongoose");
const validator = require("validator");
const AppError = require("../utils/appError");
const User = require("./user");

// Coach uchun qo‘shimcha maydonlar
const coachSchema = new mongoose.Schema(
  {
    // 1. Tajriba (yil)
    experience: {
      type: Number,
      required: [true, "Murabbiy tajribasi (yillarda) kiritilishi shart"],
      min: [0, "Tajriba 0 yildan kam bo‘lmasligi kerak"],
      max: [60, "60 yildan ortiq tajriba real emas"],
      validate: {
        validator: Number.isInteger,
        message: "Tajriba butun son bo‘lishi kerak",
      },
    },

    // 2. Ixtisoslashuvi (masalan: "Futbol hujum taktika", "Boks oyoq ishlari")
    specialization: {
      type: String,
      required: [true, "Ixtisoslashuv sohasi kiritilishi shart"],
      trim: true,
      minlength: [5, "Ixtisos juda qisqa"],
      maxlength: [100, "Ixtisos tavsifi juda uzun"],
    },

    // 3. Qaysi sport turlari bo‘yicha ishlay oladi
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

    // 4. Sportchilar ro‘yxati (avtomatik boshqariladi)
    sportsman: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sportsman",
      },
    ],

    // 5. Licenziya ma'lumotlari (ixtiyoriy, lekin muhim!)
    license: {
      number: {
        type: String,
        trim: true,
        uppercase: true,
        sparse: true, // Bir nechta murabbiyda bir xil raqam bo‘lmasligi uchun
      },
      issuedBy: { type: String, trim: true },
      issuedDate: Date,
      expiryDate: Date,
      isValid: {
        type: Boolean,
        default: true,
      },
    },

    // 6. Reyting va sharhlar (keyinchalik qo‘shilishi mumkin)
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

    // 7. Faoliyat holati
    isActive: {
      type: Boolean,
      default: true,
      select: false, // Oddiy foydalanuvchiga ko‘rinmasin
    },

    // 8. Qo‘shimcha ma'lumotlar
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio 1000 belgidan oshmasligi kerak"],
    },

    achievements: [
      {
        title: { type: String, required: true, trim: true },
        year: {
          type: Number,
          min: 1950,
          max: new Date().getFullYear() + 1,
        },
        description: { type: String, trim: true },
        _id: false,
      },
    ],

    // 9. Kontakt uchun qo‘shimcha
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

// === INDEXLAR (Tezlik uchun juda muhim!) ===
coachSchema.index({ "license.number": 1 }, { unique: true, sparse: true });
coachSchema.index({ sportTypes: 1 });
coachSchema.index({ isActive: 1 });
coachSchema.index({ experience: -1 });
coachSchema.index({ "rating.average": -1 });

// === VIRTUAL MAYDONLAR ===
coachSchema.virtual("totalSportsman").get(function () {
  return this.sportsman ? this.sportsman.length : 0;
});

// Umr bo‘yi yoshini hisoblash (User modelda birthDate bo‘lsa)
coachSchema.virtual("age").get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - this.birthDate.getFullYear();
  const m = today.getMonth() - this.birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.birthDate.getDate())) age--;
  return age;
});

// === PRE-SAVE HOOK ===
coachSchema.pre("save", function (next) {
  // Licenziya muddati o‘tgan bo‘lsa avtomatik o‘chirish
  if (this.license && this.license.expiryDate) {
    if (new Date() > this.license.expiryDate) {
      this.license.isValid = false;
    }
  }
  next();
});

// === INSTANS METODLAR ===
coachSchema.methods.getPublicProfile = function () {
  const coach = this.toObject();

  // Maxfiy ma'lumotlarni yashirish
  delete coach.isActive;
  delete coach.license;
  delete coach.__v;

  // Agar oddiy foydalanuvchi bo‘lsa, telefonni qisman yashirish
  if (coach.contact && coach.contact.phone && !this.isAdminRequest) {
    coach.contact.phone = coach.contact.phone.replace(
      /(\d{3})\d{6}(\d{2})/,
      "$1******$2"
    );
  }

  return coach;
};

// Faqat faol murabbiylar ro‘yxati uchun default query
coachSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Coach = User.discriminator("Coach", coachSchema);

module.exports = Coach;
