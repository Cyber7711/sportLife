class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.statusCode = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOpritional = true;

    Error.captureStackTrace(this, this.constructors);
  }
}

module.exports = AppError;
