const mongoose = require("mongoose");
require("dotenv").config();

/**
 * -------------- DATABASE ----------------
 */

const conn =
  process.env.NODE_ENV === "test"
    ? process.env.DB_STRING_TEST
    : process.env.DB_STRING;

// Connect to the correct environment database
mongoose.connect(conn, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Database connected");
});
