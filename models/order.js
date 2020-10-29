const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  product_id: String,
  user_id: String,
  coupon_code: String,
  quantity: Number,
  in_store: Boolean,
  date: Date,
  ship_date: Date,
  status: String,
});

mongoose.model("Order", orderSchema);
