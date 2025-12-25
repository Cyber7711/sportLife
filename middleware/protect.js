const jwt = require("jsonwebtoken");
const User = require("../model/user");
const AppError = require("../utils/appError");

exports.protect = async (req, res, next) => {
  try {
    // 1. Header borligini tekshirish
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(new AppError("Token topilmadi", 401));
    }

    // 2. Tokenni ajratib olish (Endi 'token' o'zgaruvchisi yaratildi)
    const token = header.split(" ")[1];

    // DEBUG UCHUN (Buni tekshirib bo'lgach o'chirib tashla)
    console.log("DEBUG - Kelgan Token:", token);
    console.log("DEBUG - Secret Kalit:", process.env.JWT_ACCESS_SECRET);

    // 3. Tokenni tekshirish
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(payload.id);
    if (!user) {
      return next(new AppError("Foydalanuvchi topilmadi", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(new AppError("Token noto'g'ri", 401));
    }
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token muddati tugagan", 401));
    }
    next(err);
  }
};
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Bu amalni bajarishga ruxsat yo'q", 403));
    }
    next();
  };
