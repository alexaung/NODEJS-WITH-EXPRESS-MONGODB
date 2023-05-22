const CustomError = require("../utils/customError");

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
    const message = `Resource not found. Invalid: ${err.path}. Invalid identifier provided.`;
    error = new CustomError(message, 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(
      err.keyValue
    )} entered. Please use a unique value.`;
    error = new CustomError(message, 400);
  }

  // Validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new CustomError(message, 400);
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    error = new CustomError(message, 401);
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired. Please log in again.";
    error = new CustomError(message, 401);
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
      message: "An unexpected error occurred. Please try again later.",
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
