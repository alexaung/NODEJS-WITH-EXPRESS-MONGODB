// import package
const express = require("express");
const morgan = require("morgan");
const moviesRouter = require("./routes/moviesRoutes");
const globalErrorHandler = require("./controllers/errorController");
const customErrorHandler = require("./utils/customErrorHandler");

let app = express();

// custome logger middleware
const logger = function (req, res, next) {
  console.log("Custom middleware called");
  next();
};

// express.json() is a built in middleware function in Express starting from v4.16.0.
// It parses incoming JSON requests and puts the parsed data in req.body.
app.use(express.json());

// HTTP request logger middleware for node.js
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// To serve static files such as images, CSS files, and JavaScript files,
// use the express.static built-in middleware function in Express.
app.use(express.static("./public"));

app.use(logger);

// custom middleware
app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});

// USING ROUTES
app.use("/api/v1/movies", moviesRouter);

// default route
// fallback route
app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.statusCode = 404;
  // err.status = "fail";

  const err = new customErrorHandler(
    `Can't find ${req.originalUrl} on this server`,
    404
  );

  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
