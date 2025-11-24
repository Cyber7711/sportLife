const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Notugri qiymat uchun: ${err.path} = ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue ? JSON.stringify(err.keyValue) : "duplicate value";
  const message = `Bu malumot allaqachon mavjud: ${value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Notugri malumot(lar): ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Token notugri! iltimos qayta login qilib kuring", 401);

const handleJWTExpiredError = () =>
  new AppError("Token muddati tugagan! iltimos yangi login qiling", 401);

module.exports = {
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleJWTError,
  handleValidationErrorDB,
  handleJWTExpiredError,
};
