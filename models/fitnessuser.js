const mongoose = require("mongoose");

mongoose.model(
  "FitnessUser",
  new mongoose.Schema({
    username: { type: String, required: true, unique: true },
  })
);
