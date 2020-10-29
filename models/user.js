const { Schema, model } = require("mongoose");

const addressSchema = new Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
});

const userSchema = new Schema({
  username: String,
  hash: String,
  salt: String,
  firstName: String,
  lastName: String,
  address: addressSchema,
  phone: String,
  isAdmin: Boolean,
});

model("User", userSchema);
