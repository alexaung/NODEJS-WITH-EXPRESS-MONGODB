// import package
const express = require("express");
const morgan = require("morgan");
const moviesRouter = require("./routes/moviesRoutes");

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

module.exports = app;
