const mongoose = require("mongoose");
const validator = require("validator");

// Diqqat: Fayl boshida boshqa modellarni require qilmang (Circular Dependency oldini olish uchun)

const coachSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Bir user faqat bitta Coach profiliga ega bo'la oladi
    },
    experience: {
      type: Number,
      required: [true, "Murabbiy tajribasi kiritilishi shart"],
      min: [0, "Tajriba manfiy bo‘lishi mumkin emas"],
      validate: {
        validator: Number.isInteger,
        message: "Tajriba butun son bo‘lishi kerak",
      },
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
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
    // DIQQAT: 'sportsman' arrayi OLIB TASHLANDI. Pastda virtual populate ishlatamiz.

    license: {
      number: { type: String, trim: true, uppercase: true, sparse: true },
      issuedBy: { type: String, trim: true },
      issuedDate: Date,
      expiryDate: Date,
      isValid: { type: Boolean, default: true },
    },
    rating: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      totalReviews: { type: Number, default: 0 },
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
        // Validator funksiya orqali dinamik tekshiruv
        year: {
          type: Number,
          min: 1950,
          validate: {
            validator: function (v) {
              return v <= new Date().getFullYear() + 1;
            },
            message: "Yil kelajakdagi juda uzoq sana bo'lishi mumkin emas",
          },
        },
        description: { type: String, trim: true },
        _id: false, // Sub-documentlarga alohida ID shart emas (agar kerak bo'lmasa)
      },
    ],
    contact: {
      phone: {
        type: String,
        validate: {
          validator: function (v) {
            // Agar kiritilgan bo'lsa, formatni tekshirsin. Kiritilmasa (null/bo'sh) o'tkazib yuborsin.
            return !v || validator.isMobilePhone(v, "uz-UZ");
          },
          message: "Telefon raqami noto'g'ri formatda",
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

// === VIRTUAL POPULATE (Eng muhim o'zgarish) ===
// Coach modelida "sportsmen" degan maydon yo'q, lekin biz uni bor kabi ishlatmoqchimiz.
// Bu "Sportsman" kolleksiyasiga borib, "coach" maydoni ushbu Coach ID siga teng bo'lganlarni qidiradi.
coachSchema.virtual("sportsmen", {
  ref: "Sportsman", // Qaysi modeldan qidiray?
  localField: "_id", // Menda qaysi maydon? (Mening ID im)
  foreignField: "coach", // U yerda qaysi maydon menga bog'langan?
});

// Indexlar
coachSchema.index({ "license.number": 1 }, { unique: true, sparse: true });
coachSchema.index({ sportTypes: 1 });
// Text index - Ism yoki mutaxassislik bo'yicha qidirish uchun (Keyinchalik kerak bo'ladi)
coachSchema.index({ specialization: "text", bio: "text" });

// Virtual: Yoshni Userdan olish
coachSchema.virtual("age").get(function () {
  // this.user populate qilingan bo'lsagina ishlaydi
  if (this.user && this.user.birthDate) {
    const today = new Date();
    let age = today.getFullYear() - this.user.birthDate.getFullYear();
    const m = today.getMonth() - this.user.birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < this.user.birthDate.getDate()))
      age--;
    return age;
  }
  return null;
});

// Middleware: Soft Delete Filter
coachSchema.pre(/^find/, function (next) {
  // Agar maxsus flag bo'lmasa, faqat aktivlarni ko'rsat
  if (!this.getQuery().skipIsActiveFilter) {
    this.find({ isActive: { $ne: false } });
  }
  next();
});

// Middleware: License Expire
coachSchema.pre("save", function (next) {
  if (this.license?.expiryDate && new Date() > this.license.expiryDate) {
    this.license.isValid = false;
  }
  next();
});

coachSchema.methods.getPublicProfile = function (isAdminRequest = false) {
  const coach = this.toObject();
  delete coach.isActive;
  delete coach.license; // Litsenziya raqami odatda shaxsiy bo'ladi
  delete coach.__v;

  // Telefon raqamni yashirish
  if (coach.contact?.phone && !isAdminRequest) {
    coach.contact.phone = coach.contact.phone.replace(
      /(\d{3})(\d{2})\d{5}(\d{2})/, // Regexni sal soddalashtirdim
      "$1 $2 *** ** $3"
    );
  }

  return coach;
};

const Coach = mongoose.model("Coach", coachSchema);
module.exports = Coach;
