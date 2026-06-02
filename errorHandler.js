const mongoose = require("mongoose");
const logger = require("./logger");

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, {
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      status: "fail",
      message: "Validation failed",
      errors,
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      status: "fail",
      message: `Invalid value for field '${err.path}': ${err.value}`,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      status: "fail",
      message: `A product with that ${field} already exists`,
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      status: "fail",
      message: err.message,
    });
  }

  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
};

const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
};

module.exports = { errorHandler, createError };