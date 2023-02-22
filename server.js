const app = require('./app');

//Create A Server
const port = 3000;
app.listen(port, () => {
  console.log("Server has started....");
});

