const AppError = require("../utils/appError");
const {
  handleCastErrorDB,
  handleDublicateFieldsDB,
  handleJWTError,
  handleValidationErrorDB,
  handeJWTExpiredError,
} = require("../controller/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,sonWebTokenError
    });
  }

  let error = { ...err };
  error.message = err.message;

  if (err.name === "CastError") error = handleCastErrorDB(error);
  if (err.code === 11000) error = handleDublicateFieldsDB(error);
  if (err.name === "ValidationError") error = handleValidationErrorDB(error);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handeJWTExpiredError();

  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message || "nomalum xato yuz berdi",
  });
};
