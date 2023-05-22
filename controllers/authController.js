const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const asyncErrorWrapper = require("../utils/asyncErrorWrapper");
const CustomError = require("../utils/customError");

exports.signup = asyncErrorWrapper(async (req, res, next) => {
  const user = await User.create(req.body);

  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

exports.login = asyncErrorWrapper(async (req, res, next) => {
  // Get email and password from req.body
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new CustomError("Please provide email and password", 400));
  }

  // Check if user exist && password is correct
  const user = await User.findOne({ email }).select("+password");

  // If user does not exist or password is incorrect
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new CustomError("Invalid credentials", 401));
  }

  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  // user.password = undefined;

  res.status(200).json({
    status: "success",
    token,
    // data: {
    //   user,
    // },
  });

});

// protected route
exports.protect = asyncErrorWrapper(async (req, res, next) => {
  // Get token from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Bearer token
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new CustomError("Please login to access this route", 401));
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exist
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new CustomError("User does not exist", 404));
  }

  // Check if user changed password after the token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new CustomError("User recently changed password", 401));
  }

  req.user = user;
  next();
});