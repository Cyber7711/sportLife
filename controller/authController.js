const jwt = require("jsonwebtoken");
const User = require("../model/user");
const AppError = require("../utils/appError");
const { createAccessToken, createRefreshToken } = require("../utils/token");
const registerSchema = require("../validators/authValidator");

const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const errors =
        parsed.error?.errors?.map((e) => e.message).join(" | ") ||
        "Xatolik yuz berdi";
      throw new AppError(errors, 400);
    }

    const { passwordConfirm, ...userData } = parsed.data;

    const exists = await User.findOne({
      $or: [{ email: userData.email }, { phone: userData.phone }],
    });
    if (exists) {
      throw new AppError("Foydalanuvchi allaqachon mavjud", 409);
    }

    const user = await User.create(userData);

    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      status: "success",
      accessToken,
      data: { id: user._id, role: user.role },
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
      throw new AppError("Noto'g'ri elektron pochta yoki parol", 401);
    }

    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: "success",
      accessToken,
      data: { id: user._id, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
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
