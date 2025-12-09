const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Noto‘g‘ri ID: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} "${value}" allaqachon mavjud`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Noto‘g‘ri ma'lumotlar: ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError("Noto‘g‘ri token. Qayta kiring", 401);
const handleJWTExpiredError = () =>
  new AppError("Token muddati tugagan. Qayta kiring", 401);

module.exports = {
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleValidationErrorDB,
  handleJWTError,
  handleJWTExpiredError,
};
