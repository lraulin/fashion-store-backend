const router = require("express").Router();

router.use("/exercise", require("./exercise"));
router.use("/hello", require("./hello"));
router.use("/shorturl", require("./shorturl"));
router.use("/timestamp", require("./timestamp"));
router.use("/users", require("./users"));
router.use("/whoami", require("./whoami"));
router.use("/products", require("./products"));
router.use("/orders", require("./orders"));

module.exports = router;
