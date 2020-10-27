const router = require("express").Router();

router.route("/").get((req, res) => {
  res.json({
    ipaddress: req.ip,
    language: req.headers["accept-language"],
    software: req.headers["user-agent"],
  });
});

module.exports = router;
