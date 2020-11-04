const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

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

productSchema.plugin(mongoosePaginate);

mongoose.model("Product", productSchema);
