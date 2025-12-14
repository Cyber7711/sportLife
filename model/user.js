const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ism kiritilishi shart"],
      trim: true,
      minlength: [2, "Ism kamida 2 harf bo‘lishi kerak"],
      maxlength: [30, "Ism juda uzun"],
    },
    surname: {
      type: String,
      required: [true, "Familiya kiritilishi shart"],
      trim: true,
      minlength: [2, "Familiya kamida 2 harf bo‘lishi kerak"],
      maxlength: [30, "Familiya juda uzun"],
    },
    birthDate: {
      type: Date,
      required: [true, "Tug‘ilgan sana kiritilishi shart"],
      max: [new Date(), "Tug‘ilgan sana kelajakda bulishi mumkin emas"],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email noto‘g‘ri"],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^\+998\d{9}$/, "Telefon raqami +998901234567 shaklida bo‘lsin"],
    },
    password: {
      type: String,
      required: [true, "Parol kiritilishi shart"],
      minlength: [6, "Parol kamida 6 belgi bo‘lishi kerak"],
      select: false,
    },
    passwordChangetAt: Date,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: { type: Boolean, default: true, select: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    avatar: { type: String },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("fullName").get(function () {
  return `${this.name} ${this.surname}`.trim();
});

userSchema.virtual("age").get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - this.birthDate.getFullYear();
  const m = today.getMonth() - this.birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.birthDate.getDate())) age--;
  return age;
});

userSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    return next(
      new Error("Email toki Telefon raqamidan biri kiritilishhi shart")
    );
  }
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (!this.isNew) {
    this.passwordChangetAt = Date.now() - 1000;
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangetAt) {
    const changedTimetamps = parseInt(
      this.passwordChangetAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimetamps;
  }
  return false;
};

module.exports = mongoose.model("User", userSchema);
