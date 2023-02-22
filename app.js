// import package
const express = require("express");
const morgan = require("morgan");
const moviesRouter = require("./routes/moviesRoutes");

let app = express();

// custome logger
const logger = function (req, res, next) {
  console.log("Custom middleware called");
  next();
};

// middleware to get reqest body
app.use(express.json());
app.use(morgan("dev"));
app.use(logger);
app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});

// USING ROUTES
app.use("/api/v1/movies", moviesRouter);

module.exports = app;
