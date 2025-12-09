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

// const AppError = require("../utils/appError");

// const handleCastErrorDB = (err) =>
//   new AppError(`Noto‘g‘ri ID: ${err.value}`, 400);
// const handleDuplicateFieldsDB = (err) => {
//   const field = Object.keys(err.keyValue)[0];
//   return new AppError(
//     `${field} "${err.keyValue[field]}" allaqachon mavjud`,
//     400
//   );
// };
// const handleValidationErrorDB = (err) => {
//   const errors = Object.values(err.errors).map((el) => el.message);
//   return new AppError(`Noto‘g‘ri ma'lumotlar: ${errors.join(". ")}`, 400);
// };
// const handleJWTError = () => new AppError("Noto‘g‘ri token. Qayta kiring", 401);
// const handleJWTExpiredError = () =>
//   new AppError("Token muddati tugagan. Qayta kiring", 401);

// module.exports = (err, req, res, next) => {
//   // Agar statusCode yo‘q bo‘lsa — 500
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   // DEVELOPMENT — batafsil
//   if (process.env.NODE_ENV === "development") {
//     return res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//       error: err,
//       stack: err.stack,
//     });
//   }

//   // PRODUCTION
//   let error = { ...err };
//   error.message = err.message;

//   // Ma'lum xatolar
//   if (err.name === "CastError") error = handleCastErrorDB(error);
//   if (err.code === 11000) error = handleDuplicateFieldsDB(error);
//   if (err.name === "ValidationError") error = handleValidationErrorDB(error);
//   if (err.name === "JsonWebTokenError") error = handleJWTError();
//   if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

//   // ISHLAYDIGAN JOY — BU YERDA statusCode RAQAM BO‘LADI!
//   res.status(error.statusCode).json({
//     status: error.status, // "fail" yoki "error" → faqat JSON ichida
//     message: error.message,
//   });
// };
