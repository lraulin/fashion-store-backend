const mongoose = require("mongoose");

mongoose.model(
  "Url",
  new mongoose.Schema({
    _id: { type: Number, required: true },
    url: { type: String, required: true },
  })
);
