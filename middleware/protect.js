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

    if (user.passwordChangedAt) {
      const changedAt = parseInt(user.passwordChangedAt.getTime() / 1000);
      if (payload.iat < changedAt) {
        return next(
          new AppError("Token yaroqsiz. Iltimos qayta login qiling", 401),
        );
      }
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(new AppError("Token notugri", 401));
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
