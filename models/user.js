const mongoose = require("mongoose");

mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    hash: String,
    salt: String,
    firstName: String,
    lastName: String,
    address: String,
    phone: String,
  })
);
