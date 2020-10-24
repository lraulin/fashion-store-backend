const router = require("express").Router();

router.post("/new-user", async (req, res) => {
  try {
    const { username } = req.query;

    const userFound = await FitnessUser.findOne({ username }).exec();
    if (userFound)
      return res.json({
        error: `User with username '${username}' already exists!`,
      });

    const createdUser = await FitnessUser.create({ username });

    res.json({ _id: createdUser._id, username });
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await FitnessUser.find().select("username").exec();
    res.json(users);
  } catch (e) {
    console.log(e);
  }
});

router.post("/add", async (req, res) => {
  try {
    const { userId, description, duration, date = new Date() } = req.query;

    const userFound = await FitnessUser.findById(userId);
    if (!userFound) return res.json({ error: "Invalid user id" });
    const { username } = userFound;

    const created = await Exercise.create({
      userId,
      description,
      duration,
      date,
    });

    res.json({ _id: userId, username, date, duration, description });
  } catch (e) {
    console.log(e);
  }
});

router.get("/log", async (req, res) => {
  const { userId } = req.query;
  const from = req.query.from && new Date(req.query.from);
  const to = req.query.to && new Date(req.query.to + "T23:59:59.999Z");
  const limit = req.query.limit && Number.parseInt(req.query.limit);

  try {
    const userFound = await FitnessUser.findById(userId);
    if (!userFound) return res.json({ error: "Invalid user id" });
    const { username } = userFound;

    const query = Exercise.find({
      userId,
    }).select("-_id description duration date");

    if (from) query.where("date").gt(from);
    if (to) query.where("date").lt(to);
    if (limit) query.limit(limit);

    const results = await query.exec();
    console.log(results);

    res.json({
      _id: userId,
      username,
      count: results.length,
      log: results,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
