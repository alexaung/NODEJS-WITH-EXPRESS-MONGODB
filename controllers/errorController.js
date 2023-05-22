const customErrorHandler = require("../utils/customErrorHandler");

const devError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stackTrack: err.stack,
    error: err,
  });
};

const prodError = (err, res) => {
  // Production error
  let error = { ...err };
  error.message = err.message;

  // Wrong id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    error = new customErrorHandler(message, 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    error = new customErrorHandler(message, 400);
  }

  // Validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new customErrorHandler(message, 400);
  }

  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message || "Internal Server Error",
    });
  } else {
    // Unknown error
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

// Error handling middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Development error
  if (process.env.NODE_ENV === "development") {
    devError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    prodError(err, res);
  }
};
