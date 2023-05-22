const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const asyncErrorWrapper = require("../utils/asyncErrorWrapper");
const CustomError = require("../utils/customError");
const sendEmail = require("../utils/emailHandler");
const crypto = require("crypto");

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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ["admin", "user"]
    if (!roles.includes(req.user.role)) {
      return next(new CustomError("You are not authorized", 403));
    }
    next();
  };
};

exports.forgotPassword = asyncErrorWrapper(async (req, res, next) => {
  // Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new CustomError("User does not exist", 404));
  }

  // Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message: `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new CustomError("There was an error while sending email", 500));
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to email",
  });
});

exports.resetPassword = asyncErrorWrapper(async (req, res, next) => {
  // Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  // If token has not expired and there is user, set the new password
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is invalid or expired", 400));
  }

  // Update changedPasswordAt property for the user
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // Save user
  await user.save();

  // Log the user in, send JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  res.status(200).json({
    status: "success",
    token,
  });
});
