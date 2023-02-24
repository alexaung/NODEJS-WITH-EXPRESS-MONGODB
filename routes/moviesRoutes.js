const express = require("express");
const moviesController = require("../controllers/moviesController");

const router = express.Router();

// router.param("id", moviesController.checkId);

router
  .route("/")
  .get(moviesController.getAllMovies)
  //chaining multiple middleware
  .post(moviesController.createMovie);

router
  .route("/:id")
  .get(moviesController.getMovie)
  .patch(moviesController.updateMovie)
  .delete(moviesController.deleteMovie);

module.exports = router;
