const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ism yozilishi shart"],
      maxlength: [13, "Ism 13 ta harfdan ko'p bo'lmasligi kerak"], // ✅ max -> maxlength
      minlength: [3, "Ism 3 ta harfdan kam bo'lmasligi kerak"], // ✅ min -> minlength
      match: [
        /^[A-Za-z\u0400-\u04FF\s'-]+$/,
        "Ism faqat harflardan iborat bo'lishi kerak",
      ],
      trim: true,
    },
    surname: {
      // ✅ "surename" -> "surname" (to'g'ri yozilishi)
      type: String,
      required: [true, "Familiya kiritilishi shart"],
      maxlength: [13, "Familiya 13 ta harfdan ko'p bo'lmasligi kerak"],
      minlength: [3, "Familiya 3 ta harfdan kam bo'lmasligi kerak"],
      match: [
        /^[A-Za-z\u0400-\u04FF\s'-]+$/,
        "Familiya faqat harflardan iborat bo'lishi kerak",
      ],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Telefon raqam kiritilishi shart"], // ✅ "require" -> "required"
      match: [/^\+?[1-9]\d{1,14}$/, "Telefon formati noto'g'ri"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Parol kiritilishi shart"],
      minlength: [6, "Parol 6 tadan kam bo'lmasligi kerak"],
      select: false, // ✅ Parol avtomatik o'chirish (security)
    },
    role: {
      type: String,
      required: [true, "Rol kiritilishi shart"],
      enum: {
        values: ["Coach", "Sportsman", "Parent", "Admin"],
        message: "Rol noto'g'ri",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    email: {
      type: String,
      required: [true, "Email kiritilishi shart"],
      unique: true,
      trim: true,
      lowercase: true, // ✅ Email ni kichik harfga o'tkazish
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Email noto'g'ri formatda",
      ],
      maxlength: [30, "Email 30 ta belgidan uzun bo'lmasligi kerak"], // ✅ validate o'rniga
    },
    emailVerified: {
      type: Boolean, // ✅ Date o'rniga Boolean (oddiyroq)
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field
userSchema.virtual("fullName").get(function () {
  return `${this.name} ${this.surname}`; // ✅ "surename" -> "surname"
});

// Static methods
userSchema.statics.findActive = function (role) {
  const query = { isActive: true };
  if (role) query.role = role;
  return this.find(query);
};

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.verifyEmail = function () {
  this.emailVerified = true;
  return this.save();
};

userSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

// Middleware
userSchema.pre("save", async function (next) {
  // Faqat password o'zgarganda hash qilish
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password ni yangilashda eski hash ni saqlash
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // Agar parol yangilansa, yangi hash yaratish kerak
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
