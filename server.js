const dotenv = require("dotenv");
// it should alway put before other
dotenv.config({ path: "./config.env" });

const app = require("./app");

//console.log(app.get('env'))
console.log(process.env);
//Create A Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server has started....");
});
