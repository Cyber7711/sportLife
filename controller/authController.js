const jwt = require("jsonwebtoken");
const User = require("../model/user");
const AppError = require("../utils/appError");
const { createAccessToken, createRefreshToken } = require("../utils/token");
const registerSchema = require("../validators/authValidator");
const catchAsync = require("../middleware/asyncWrapper");
const Coach = require("../model/coach");
const Sportsman = require("../model/sportsman");

const register = catchAsync(async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(" | ");
    return next(new AppError(errors, 400));
  }

  const { passwordConfirm, birthDate, ...userData } = parsed.data;

  const exists = await User.findOne({
    $or: [{ email: userData.email }, { phone: userData.phone }],
  });
  if (exists)
    return next(
      new AppError("Email yoki telefon allaqachon ro'yxatdan o'tgan", 409)
    );

  userData.birthDate = new Date(birthDate);
  const user = await User.create(userData);

  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    status: "success",
    accessToken,
    data: {
      user: {
        id: user._id,
        role: user.role,
        fullName: user.fullName,
      },
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email va parolni kiriting", 400));
  }

  const user = await User.findOne({ email }).select("+password +isActive");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Email yoki parol noto'g'ri", 401));
  }

  if (!user.isActive) {
    return next(new AppError("Sizning hisobingiz bloklangan", 403));
  }

  let profile = null;
  if (user.role === "coach") {
    profile = await Coach.findOne({ user: user._id });
  } else if (user.role === "sportsman") {
    profile = await Sportsman.findOne({ user: user._id }).populate("coach");
  }

  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, { lastLoginAt: Date.now() });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    accessToken,
    data: {
      user: {
        id: user._id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        profile: profile,
      },
    },
  });
});

const refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return next(new AppError("Refresh token mavjud emas", 401));

  const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(payload.id);

  if (!user || !user.isActive)
    return next(new AppError("Ruxsat berilmadi", 401));

  const newAccessToken = createAccessToken(user._id);

  res.status(200).json({ status: "success", accessToken: newAccessToken });
});

const getMe = catchAsync(async (req, res, next) => {
  let profile = null;
  if (!req.user) return next(new AppError("Siz tizimga kirmagansiz", 401));

  if (req.user.role === "coach") {
    profile = await Coach.findOne({ user: req.user._id });
  } else if (req.user.role === "sportsman") {
    profile = await Sportsman.findOne({ user: req.user._id });
  }

  const user = await User.findById(req.user._id);
  res
    .status(200)
    .json({ status: "success", data: { user: req.user, profile } });
});

module.exports = { register, login, getMe, refreshToken };
