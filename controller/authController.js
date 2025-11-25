const jwt = require("jsonwebtoken");
const User = require("../model/user");
const AppError = require("../utils/appError");
const { createAccessToken, createRefreshToken } = require("../utils/token");

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

    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    res.status(201).json({
      status: "success",
      accessToken,
      refreshToken,
      data: { id: user._id, email: user.email, role: user.role },
    });
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

    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    res.status(200).json({
      status: "success",
      accessToken,
      refreshToken,
      data: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw new AppError("Refresh token mavjud emas", 401);

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) throw new AppError("Foydalanuvchi topilmadi", 401);

    const accessToken = createAccessToken(user._id);

    res.status(200).json({ status: "success", accessToken });
  } catch (err) {
    return next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
};

const authController = { register, login, getMe, refreshToken };

module.exports = authController;
