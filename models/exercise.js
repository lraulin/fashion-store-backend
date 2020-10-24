const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

mongoose.model(
  "Exercise",
  new mongoose.Schema({
    userId: { type: ObjectId, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, required: true },
  })
);
