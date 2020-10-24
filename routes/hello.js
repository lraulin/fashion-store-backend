const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ greeting: "hello API" });
});

module.exports = router;
