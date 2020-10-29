const express = require("express");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
require("dotenv").config();

const app = express();

// Configures the database and opens a global connection that can be used in any module with `mongoose.connection`
require("./config/database");

// Load Mongoose models
require("./models");

// Pass the global passport object into the configuration function
require("./config/passport")(passport);

// Must be after models are loaded
const routes = require("./routes");

// This will initialize the passport object on every request
app.use(passport.initialize());

// Instead of using body-parser middleware, use the new Express implementation of the same thing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Imports all of the routes from ./routes/index.js
app.use(routes);

// Start server
const { PORT } = process.env || 3000;
app.listen(PORT);
