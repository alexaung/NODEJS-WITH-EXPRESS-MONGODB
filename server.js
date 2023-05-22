const mongoose = require("mongoose");
const dotenv = require("dotenv");
// it should alway put before other
dotenv.config({ path: "./config.env" });

const app = require("./app");

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    console.log("DB Conneciton Successful");
  });

// .catch((error) => {
//   console.log("Some error has occured");
// }); // Will take care of all the errors that are not handled

//Create A Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log("Server has started....");
});

// Unhandled Rejection
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection. Shutting down...");
  
  server.close(() => {
    process.exit(1);
  });
});
