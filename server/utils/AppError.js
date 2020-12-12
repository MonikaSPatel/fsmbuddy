class AppError extends Error {
  constructor(message) {
    super(message);

    this.statusCode = 404;
    this.status = "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
