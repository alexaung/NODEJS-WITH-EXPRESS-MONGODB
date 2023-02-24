const mongoose = require("mongoose");
// schema
const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Name is reuired field"],
    unique: true,
  },
  description: String,
  duration: { type: Number, require: [true, "Duration is required field"] },
  ratings: { type: Number, default: 1.0 },
});

// model
const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
