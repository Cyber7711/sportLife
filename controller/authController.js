const jwt = require("jsonwebtoken");
const User = require("../model/user");
const AppError = require("../utils/appError");

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const register = async (req, res, next) => {
  try {
    const { name, surename, phone, email, password, role } = req.body;
    const missingFields = [];

    if (!email) missingFields.push("email");
    if (!surename) missingFields.push("surename");
    if (!phone) missingFields.push("phone");
    if (!name) missingFields.push("name");
    if (!password) missingFields.push("password");
    if (!role) missingFields.push("role");

    if (missingFields.length > 0) {
      throw new AppError(
        `Quyidagi maydon(lar) tuldirilmagan: ${missingFields.join(", ")}`,
        400
      );
    }
    const user = await User.create({
      name,
      surename,
      phone,
      email,
      password,
      role,
    });

    const token = signToken(user);
    res.status(201).json({ status: "success", token, data: user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Email va parolni kiriting", 400);
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Email yoki password notugri", 401);
    }

    user.lastLogin = Date.now();
    await user.save();

    const token = signToken(user);
    res.status(200).json({ status: true, token, data: user });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findOne(req.user._id);
    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
};

const authController = { register, login, getMe };

module.exports = authController;
