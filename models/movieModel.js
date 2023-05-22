const mongoose = require("mongoose");
const fs = require("fs");
const validator = require("validator");
// movie schema
const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Name is reuired field"],
      unique: true,
      maxlength: [100, "Name must be less than 100 characters"],
      minlength: [5, "Name must be more than 5 characters"],
      trim: true,
      // validate: [validator.isAlpha, "Name must only contain characters"], // validator package
    },
    description: {
      type: String,
      require: [true, "Description is required field"],
      trim: true,
    },
    duration: { type: Number, require: [true, "Duration is required field"] },
    ratings: {
      type: Number,
      validate: {
        validator: function (value) { // custom validator
          return value >= 1 && value <= 10;
        },
        message: "Rating {VALUE} must be between 1 and 10",
      },
    },
    totalRatings: { type: Number },
    releaseYear: {
      type: Number,
      require: [true, "Release year is required field"],
    },
    releaseDate: {
      type: Date,
      require: [true, "Release date is required field"],
    },
    createdAt: { type: Date, default: Date.now(), select: false },
    genres: {
      type: [String],
      require: [true, "Genre is required field"],
      // enum: {
      //   values: ["action", "adventure", "comedy", "drama", "fantasy", "horror"],
      //   message: "Genre is either: action, adventure, comedy, drama, fantasy, horror",
      // },
    },
    directors: {
      type: [String],
      require: [true, "Director is required field"],
      trim: true,
    },
    coverImage: {
      type: String,
      require: [true, "Cover image is required field"],
    },
    actors: {
      type: [String],
      require: [true, "Actor is required field"],
    },
    price: {
      type: Number,
      require: [true, "Price is required field"],
    },
    createdBy: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual property
movieSchema.virtual("durationInHours").get(function () {
  return this.duration / 60;
});

// middleware
// document middleware
movieSchema.pre(/^save/, function (next) {
  // console.log(this);
  this.createdBy = "Admin";
  next();
});

movieSchema.post(/^save/, function (doc, next) {
  const content = `Movie ${doc.name} is created by ${doc.createdBy} at ${doc.createdAt} \n`;
  fs.writeFileSync("./log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err.message);
  });
  next();
});

// query middleware
movieSchema.pre(/^find/, function (next) {
  this.find({ releaseDate: { $lte: Date.now() } });
  this.startTime = Date.now();
  next();
});

movieSchema.post(/^find/, function (doc, next) {
  this.find({ releaseDate: { $lte: Date.now() } });
  this.endTime = Date.now();

  const timeTaken = this.endTime - this.startTime;
  const content = `Query took ${timeTaken} milliseconds \n`;
  fs.writeFileSync("./log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err.message);
  });
  next();
});

// aggregation middleware
movieSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { releaseDate: { $lte: Date.now() } } });
  next();
});

// model
const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
