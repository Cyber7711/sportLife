// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Ism yozilishi shart"],
//       maxlength: [13, "Ism 13 ta harfdan ko'p bo'lmasligi kerak"],
//       minlength: [3, "Ism 3 ta harfdan kam bo'lmasligi kerak"],
//       match: [
//         /^[A-Za-z\u0400-\u04FF\s'-]+$/,
//         "Ism faqat harflardan iborat bo'lishi kerak",
//       ],
//       trim: true,
//     },
//     surname: {
//       type: String,
//       required: [true, "Familiya kiritilishi shart"],
//       maxlength: [13, "Familiya 13 ta harfdan ko'p bo'lmasligi kerak"],
//       minlength: [3, "Familiya 3 ta harfdan kam bo'lmasligi kerak"],
//       match: [
//         /^[A-Za-z\u0400-\u04FF\s'-]+$/,
//         "Familiya faqat harflardan iborat bo'lishi kerak",
//       ],
//       trim: true,
//     },
//     phone: {
//       type: String,
//       required: [true, "Telefon raqam kiritilishi shart"],
//       match: [/^\+?[1-9]\d{1,14}$/, "Telefon formati noto'g'ri"],
//       unique: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: [true, "Parol kiritilishi shart"],
//       minlength: [6, "Parol 6 tadan kam bo'lmasligi kerak"],
//       select: false,
//     },
//     role: {
//       type: String,
//       required: [true, "Rol kiritilishi shart"],
//       enum: {
//         values: ["Coach", "Sportsman", "Parent"],
//         message: "Rol noto'g'ri",
//       },
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     email: {
//       type: String,
//       required: [true, "Email kiritilishi shart"],
//       unique: true,
//       trim: true,
//       lowercase: true,
//       match: [
//         /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
//         "Email noto'g'ri formatda",
//       ],
//       maxlength: [30, "Email 30 ta belgidan uzun bo'lmasligi kerak"],
//     },
//     emailVerified: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// userSchema.virtual("fullName").get(function () {
//   return `${this.name} ${this.surname}`;
// });

// userSchema.statics.findActive = function (role) {
//   const query = { isActive: true };
//   if (role) query.role = role;
//   return this.find(query);
// };

// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// userSchema.pre("save", function (next) {
//   if (!this.isModified("password") || this.isNew) return next();

//   next();
// });

// userSchema.pre("save", function (next) {
//   if (!this.phone || !this.email) {
//     return next(new Error("Telefon raqami yoki email bulishi kerak"));
//   }
//   next();
// });

// const User = mongoose.model("User", userSchema);

// module.exports = User;

// models/userModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ism kiritilishi shart"],
      trim: true,
      minlength: [2, "Ism kamida 2 harf"],
      maxlength: [30, "Ism juda uzun"],
    },
    surname: {
      type: String,
      required: [true, "Familiya kiritilishi shart"],
      trim: true,
      minlength: [2],
      maxlength: [30],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // faqat bor bo‘lsa unique bo‘lsin
      match: [/^\+998\d{9}$/, "Telefon raqami +998901234567 shaklida bo‘lsin"],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email noto‘g‘ri"],
    },
    password: {
      type: String,
      required: [true, "Parol kiritilishi shart"],
      minlength: [6, "Parol kamida 6 belgi"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "coach", "parent"],
      default: "parent",
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    avatar: String,
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual fullName
userSchema.virtual("fullName").get(function () {
  return `${this.name} ${this.surname}`.trim();
});

// Parolni hash qilish
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Parolni tekshirish
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Faqat bitta aloqa turi bo‘lishi kerak
userSchema.pre("save", function (next) {
  if (!this.phone && !this.email) {
    return next(
      new Error("Telefon yoki emaildan kamida bittasi bo‘lishi kerak")
    );
  }
  next();
});

// userModel.js da password o‘zgartirilganda
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // Token chiqarilgandan 1 soniya oldin saqlaymiz (iat bilan to‘qnashmaslik uchun)
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

module.exports = mongoose.model("User", userSchema);
