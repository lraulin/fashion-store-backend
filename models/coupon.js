const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: String,
  discount: Number,
  expiration_date: Date,
  valid: Boolean,
});

mongoose.model("Coupon", couponSchema);
