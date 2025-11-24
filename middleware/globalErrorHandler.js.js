const AppError = require("../utils/appError");
const {
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleJWTError,
  handleValidationErrorDB,
  handleJWTExpiredError,
} = require("../controller/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  if (err.name === "CastError") err = handleCastErrorDB(err);
  if (err.code === 11000) err = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") err = handleValidationErrorDB(err);
  if (err.name === "JsonWebTokenError") err = handleJWTError();
  if (err.name === "TokenExpiredError") err = handleJWTExpiredError();

  if (process.env.NODE_ENV === "production") {
    if (!err.isOperational && err.name.startsWith("JsonWebToken")) {
      err = handleJWTError();
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    console.error("Error", err, err.stack);
    return res
      .status(500)
      .json({ status: "error", message: "Kutilmagan xatolik" });
  }
};
