const express = require("express");
const cors = require("cors");
const path = require("path");
const passport = require("passport");

/**
 * -------------- GENERAL SETUP ----------------
 */

require("dotenv").config();

var app = express();

// Configures the database and opens a global connection that can be used in any module with `mongoose.connection`
require("./config/database");

// Load Mongoose models
require("./models");

// Pass the global passport object into the configuration function
require("./config/passport")(passport);

// This will initialize the passport object on every request
app.use(passport.initialize());

// Instead of using body-parser middleware, use the new Express implementation of the same thing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// app.use(express.static(path.join(__dirname, "public")));

/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use(require("./routes"));

/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(8090);
