const mongoose = require("mongoose");

mongoose.model(
  "Counter",
  new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, required: true },
  })
);
