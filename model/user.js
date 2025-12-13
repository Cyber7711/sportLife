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
    birthDate: {
      type: Date,
      required: [true, "Tug'ilgan sana kiritilishi shart"],
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

userSchema.virtual("fullName").get(function () {
  return `${this.name} ${this.surname}`.trim();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre("save", function (next) {
  if (!this.phone && !this.email) {
    return next(
      new Error("Telefon yoki emaildan kamida bittasi bo‘lishi kerak")
    );
  }
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

module.exports = mongoose.model("User", userSchema);
