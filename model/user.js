const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ism yozilishi shart"],
      max: [13, "ism 13 ta so'zdan kop bulmasligi kerak"],
      min: [3, "ism 3 ta so'zdan kam bolmasligi kerak"],
      match: [/^[A-Za-z\u0400-\u04FF\s'-]+$/, "Ism faqat harf bolishi kerak"],
      trim: true,
    },
    surename: {
      type: String,
      required: [true, "Familiya kiritilishi shart"],
      max: [13, "Familiya 13 ta sozdan kop bulmasligi kerak"],
      min: [3, "Familiya 3 ta sozdan kam bolmasligi kerak"],
      match: [
        /^[A-Za-z\u0400-\u04FF\s'-]+$/,
        "Familiya faqat harf bolishi kerak",
      ],
      trim: true,
    },
    phone: {
      type: String,
      require: [true, "Telefon raqam kiritilishi shart"],
      match: [/^\+?[1-9]\d{1,14}$/, "Telefon formati notugri"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Parol kiritilishi shart"],
      trim: true,
      minlength: [6, "Parol 6 tadan kam bulmasligi kerak"],
    },
    role: {
      type: String,
      required: [true, "Urni kiritilishi shart"],
      trim: true,
      enum: {
        values: ["Coach", "Sportsman", "Parent", "Admin"],
        message: "Urni notugri",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    email: {
      type: String,
      required: [true, "email kiritilishi shart"],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "email notugri formatda",
      ],
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    validate: {
      validator: function (email) {
        return (email.length = 30);
      },
      message: "email 30 ta belgidan ",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.virtual("fullName").get(function () {
  return `${this.name} ${this.surename}`;
});

userSchema.statics.findActive = function (role) {
  return this.find({ role, isActive: true });
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const isMatch = await user.comparePassword(kiritilganParol);
if (!isMatch) {
  throw new Error("parol notugri");
}

const User = mongoose.model("User", userSchema);
