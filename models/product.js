const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  department: String,
  photo_url: String,
  wholesale_price_cents: Number,
  retail_price_cents: Number,
  discountable: Boolean,
  stock: Number,
  deleted: Boolean,
});

mongoose.model("Product", productSchema);
