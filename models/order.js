const { Schema, model } = require("mongoose");

const orderItemSchema = new Schema({
  product_id: String,
  quantity: Number,
});

const orderSchema = new Schema({
  items: [orderItemSchema],
  user_id: String,
  coupon_code: String,
  in_store: Boolean,
  date: Date,
  ship_date: Date,
  status: String,
});

model("Order", orderSchema);
