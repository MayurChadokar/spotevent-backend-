require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./config/db"); // Import database configuration
const actionRoute = require("./routes/actionRoute"); // Import action routes
const fs = require("fs");
const https = require("https");
// Middleware and configurations
// app.use(
//  cors({
  //  origin: "*", // Consider replacing "*" with specific domains
    //methods: ["POST", "GET", "PUT", "DELETE", "PATCH", "UPDATE"],
//  })
// );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Api Routes

app.use("/api/v1", actionRoute); // Use action routes

// Start the server
const port = process.env.PORT || 8080;

// const options = {
//  key: fs.readFileSync("ssl/key.pem"),
//  cert: fs.readFileSync("ssl/cert.pem"),
// };

// const sslServer = https.createServer(options, app);

// sslServer.listen(port, () => {
//
//  console.log(`server is running on port ${port}`);
// });

 app.listen(port, () => {
   console.log(`Server Running On Port ${port}`);
 });
