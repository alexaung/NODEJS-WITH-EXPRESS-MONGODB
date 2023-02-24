const mongoose = require("mongoose");
const dotenv = require("dotenv");
// it should alway put before other
dotenv.config({ path: "./config.env" });

const app = require("./app");

//console.log(app.get('env'))
//console.log(process.env);

mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    //console.log(conn);
    console.log("DB Conneciton Successful");
  })
  .catch((error) => {
    console.log("Some error has occured");
  });

// testing
// const testMovie = new Movie({
//   name: "Die Hard",
//   description:
//     "Action packed movie staring bruce willis in this trilling adventure.",
//   duration: 139,
//   ratings: 4.5,
// });

// testMovie
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log("Error occured: " + err);
//   });

//Create A Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server has started....");
});
