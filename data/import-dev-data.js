const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Movie = require("./../models/movieModel");

dotenv.config({ path: "./config.env" });

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    console.log("DB Conneciton Successful");
  })
  .catch((error) => {
    console.log("Some error has occured");
  });

const movies = JSON.parse(fs.readFileSync("./data/movies.json", "utf-8"));
// console.log(movies);

const deleteMovies = async () => {
  try {
    await Movie.deleteMany();
    console.log("Movies deleted");
  } catch (error) {
    console.log(error);
  }
  process.exit();
  
};

const importMovies = async () => {
  try {
    await Movie.create(movies);
    console.log("Movies imported");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === "--delete") deleteMovies();
if (process.argv[2] === "--import") importMovies();
