const mongoose = require("mongoose");

var mongourl = process.env.MONGOURL;

mongoose.connect(mongourl)
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((error) => {
    console.log("Received an error:", error);
  });

module.exports = mongoose;
