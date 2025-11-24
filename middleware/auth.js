const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const User = require("../model/user");

exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("Token topilmadi", 401);
    }
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) throw new AppError("Foydalanuvchi topilmadi", 401);
    req.user = user;
    next();
  } catch (err) {
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
