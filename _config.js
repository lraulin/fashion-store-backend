// *** config file *** //
var config = require("./_config");

// *** mongoose *** ///
mongoose.connect(config.mongoURI[app.settings.env], function (err, res) {
  if (err) {
    console.log("Error connecting to the database. " + err);
  } else {
    console.log("Connected to Database: " + config.mongoURI[app.settings.env]);
  }
});
