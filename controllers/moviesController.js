const fs = require("fs");
const Movie = require("./../models/movieModel");
const QueryHandler = require("../utils/queryHandler");
const customErrorHandler = require("../utils/customErrorHandler");
const asyncErrorWrapper = require("../utils/asyncErrorWrapper");
const mongoose = require("mongoose");

// aliasing route
exports.aliasTopMovies = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratings";
  next();
};

exports.getAllMovies = asyncErrorWrapper(async (req, res, next) => {
  let queryHandler = new QueryHandler(Movie.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const movies = await queryHandler.query;

  res.status(200).json({
    status: "success",
    count: movies.length,
    data: {
      movies,
    },
  });
});

exports.getMovie = asyncErrorWrapper(async (req, res, next) => {
  const id = req.params.id;

  // check if id is valid ObjectId
  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   const error = new customErrorHandler("Invalid id", 400);
  //   return next(error);
  // }

  const movie = await Movie.findById(id);

  if (!movie) {
    return next(new customErrorHandler("There is no movie with that id", 400));
  }

  res.status(200).json({
    status: "success",
    data: {
      movie,
    },
  });
});

exports.createMovie = asyncErrorWrapper(async (req, res, next) => {
  const movie = await Movie.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      movie,
    },
  });
});

exports.updateMovie = async (req, res, next) => {
  try {
    const updateMovie = Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updateMovie) {
      return next(
        new customErrorHandler("There is no movie with that id", 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        updateMovie,
      },
    });
  } catch (err) {
    res.stats(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteMovie = asyncErrorWrapper(async (req, res, next) => {
  const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

  if (!deletedMovie) {
    return next(new customErrorHandler("There is no movie with that id", 400));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// AGGREGATION PIPELINE
exports.getMovieStats = asyncErrorWrapper(async (req, res, next) => {
  const stats = await Movie.aggregate([
    {
      $match: { ratings: { $gte: 4.5 } },
    },
    {
      $group: {
        //_id: null,
        _id: "$releaseYear",
        numMovies: { $sum: 1 },
        avgRating: { $avg: "$ratings" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { minPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

// AGGREGATION PIPELINE
exports.getMovieByGenre = asyncErrorWrapper(async (req, res, next) => {
  const genre = req.params.genre;
  const stats = await Movie.aggregate([
    { $unwind: "$genres" },
    {
      $group: {
        _id: "$genres",
        numMovies: { $sum: 1 },
        movies: { $push: "$name" },
      },
    },
    {
      $addFields: { genre: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numMovies: -1 },
    },
    {
      $match: { genre: genre },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});
