const fs = require("fs");
const Movie = require("./../models/movieModel");

// ROUTE HANDLER FUNCTIONS

exports.getAllMovies = async (req, res) => {
  try {
    let queryObj = { ...req.query }; // Duplicate the query object
    let excludedFields = ["sort", "page", "limit", "fields"];

    excludedFields.forEach((el) => delete queryObj[el]);

    // 1. Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryObj = JSON.parse(queryStr);
    let query = Movie.find(queryObj);

    // 2. Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt"); // default sort
    }

    // 3. Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v"); // excluding the version field
    }

    // 4. Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100; // default limit is 100
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numMovies = await Movie.countDocuments();
      if (skip >= numMovies) throw new Error("This page does not exist");
    }

    // Execute the query
    const movies = await query;

    res.status(200).json({
      status: "success",
      count: movies.length,
      data: {
        movies,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        movie,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        movie,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const updateMovie = Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        updateMovie,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.deleteMovie = (req, res) => {
  try {
    const movie = Movie.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};
