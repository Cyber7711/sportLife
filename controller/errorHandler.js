const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Notugri ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDublicateFieldsDB = (err) => {
  const value = err.keyValue ? JSON.stringify(keyValue) : "dublicate value";
  const message = `Bu malumot allaqachon mavjud: ${value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => {
    el.message;
  });
  const message = `Notugri malumot(lar): ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  new AppError("Token notugri! iltimos qayta login qilib kuring", 401);
};

const handeJWTExpiredError = () => {
  new AppError("Token muddati tugagan! iltimos yangi login qiling", 401);
};

module.exports = {
  handleCastErrorDB,
  handleDublicateFieldsDB,
  handleJWTError,
  handleValidationErrorDB,
  handeJWTExpiredError,
};
