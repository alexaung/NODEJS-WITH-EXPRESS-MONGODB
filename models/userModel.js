const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    minlength: [8, "Please provide a password with min length 8"],
    required: [true, "Please provide a password"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please provide a password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Please provide the same password",
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  // Hashing password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);

      this.password = hash;
      this.confirmPassword = undefined;
      next();
    });
  });
});

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter =  function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
