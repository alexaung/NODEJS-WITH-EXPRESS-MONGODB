const express = require("express");
const moviesController = require("../controllers/moviesController");
const authController = require("../controllers/authController");

const router = express.Router();

// router.param("id", moviesController.checkId);

router.route("/top-rated").get(moviesController.aliasTopMovies, moviesController.getAllMovies);

router.route("/movie-stats").get(moviesController.getMovieStats);

router.route("/movies-by-genre/:genre").get(moviesController.getMovieByGenre);

router
  .route("/")
  .get(authController.protect, moviesController.getAllMovies)
  //chaining multiple middleware
  .post(moviesController.createMovie);

router
  .route("/:id")
  .get(authController.protect, authController.restrictTo("user", "admin"), moviesController.getMovie)
  .patch(moviesController.updateMovie)
  .delete(authController.protect, authController.restrictTo('admin'), moviesController.deleteMovie);

module.exports = router;
