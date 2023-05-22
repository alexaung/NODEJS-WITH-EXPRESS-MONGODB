const mongoose = require("mongoose");
// schema
const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Name is reuired field"],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    require: [true, "Description is required field"],
    trim: true,
  },
  duration: { type: Number, require: [true, "Duration is required field"] },
  ratings: { type: Number },
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
    trim: true,
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
});

// model
const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
