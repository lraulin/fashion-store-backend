const router = require("express").Router();

const output = (date = new Date()) => ({
  unix: date.getTime(),
  utc: date.toUTCString(),
});

router.get("/:date?", (req, res) => {
  const { date } = req.params;

  if (!date) {
    return res.json(output());
  }

  const parsedUtcDate = new Date(date);
  if (parsedUtcDate.toString() !== "Invalid Date") {
    return res.json(output(parsedUtcDate));
  }

  const numberRx = RegExp("^[0-9]+$");
  if (numberRx.test(date)) {
    return res.json(output(new Date(Number.parseInt(date))));
  }

  res.json({ error: "Invalid Date" });
});

module.exports = router;
