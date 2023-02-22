const fs = require("fs");

let movies = JSON.parse(fs.readFileSync("./data/movies.json"));

exports.checkId = (req, res, next, value) => {
  console.log("Movie ID is " + value);

  const movie = movies.find((movie) => movie.id === value * 1);

  if (!movie) {
    return res.status(404).json({
      status: "Fail",
      message: "Movie with ID " + value + " is not found",
    });
  }
  next();
};

exports.validateBody = (req, res, next) => {
  if (!req.body.name || !req.body.releaseYear) {
    return res.status(400).json({
      status: "Fail",
      message: "Not a valid movie data",
    });
  }
  next();
};

// ROUTE HANDLER FUNCTIONS

exports.getAllMovies = (req, res) => {
  res.status(200).json({
    status: "Success",
    requestedAt: req.requestedAt,
    count: movies.length,
    data: {
      movies: movies,
    },
  });
};

exports.getMovie = (req, res) => {
  const id = req.params.id * 1;
  const movie = movies.find((movie) => movie.id === id);

  // if (!movie) {
  //   return res.status(404).json({
  //     status: "Fail",
  //     message: "Movie with ID " + id + " is not found",
  //   });
  // }

  res.status(200).json({
    status: "Success",
    data: {
      movie: movie,
    },
  });
};

exports.updateMovie = (req, res) => {
  let id = req.params.id * 1;
  let movieToUpdate = movies.find((movie) => movie.id === id);

  // if (!movieToUpdate) {
  //   return res.status(404).json({
  //     status: "Fail",
  //     message: "Movie with ID " + id + " is not found",
  //   });
  // }

  let index = movies.indexOf(movieToUpdate);
  let updatedMovieObject = Object.assign(movieToUpdate, req.body);
  movies[index] = updatedMovieObject;

  fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
    res.status(200).json({
      status: "Success",
      count: movies.length,
      data: {
        movies: updatedMovieObject,
      },
    });
  });
};

exports.createMovie = (req, res) => {
  //console.log(req.body);
  const newId = movies[movies.length - 1].id + 1;
  let newMovie = Object.assign({ id: newId }, req.body);
  movies.push(newMovie);

  fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
    res.status(201).json({
      status: "Success",
      count: movies.length,
      data: {
        movies: movies,
      },
    });
  });
};

exports.deleteMovie = (req, res) => {
  const id = req.params.id * 1;
  let movieToDelete = movies.find((movie) => movie.id === id);

  // if (!movieToDelete) {
  //   return res.status(404).json({
  //     status: "Fail",
  //     message: "Movie with ID " + id + " is not found",
  //   });
  // }

  let index = movies.indexOf(movieToDelete);
  movies.splice(index, 1);

  fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
    res.status(204).json({
      status: "Success",
      data: {
        movie: null,
      },
    });
  });
};
