const router = require("express").Router();
const mongoose = require("mongoose");
const Counter = mongoose.model("Counter");
const Url = mongoose.model("Url");

const counter = Counter.findById("urlId");
if (!counter)
  Counter.create({
    _id: "urlId",
    sequence_value: 0,
  });

const getNextSequenceValue = async () => {
  const updatedDoc = await Counter.findOneAndUpdate(
    { _id: "urlId" },
    { $inc: { sequence_value: 1 } },
    { new: true }
  ).exec();
  return updatedDoc.sequence_value;
};

const createAndSaveUrl = async (url) => {
  const _id = await getNextSequenceValue("urlId");
  const createdDoc = await Url.create({ _id, url });
  return createdDoc;
};

const validURL = (str) =>
  !!new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$", // fragment locator
    "i"
  ).test(str);

router.post("/new", async (req, res) => {
  try {
    const url = decodeURIComponent(req.query.url);
    if (!validURL) {
      return res.json({ error: "Invalid URL" });
    }

    // Check to see if URL exists
    const found = await Url.findOne({ url });

    // If exists, return
    if (found) {
      res.json({ original_url: found.url, short_url: found._id });
    } else {
      // Else create
      const created = await createAndSaveUrl(url);
      res.json({ original_url: created.url, short_url: created._id });
    }
  } catch (e) {
    console.log(e);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Url.findById(ObjectId(req.params.id));
    if (doc) res.redirect(doc.url);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
