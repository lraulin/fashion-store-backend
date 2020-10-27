const router = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const Order = mongoose.model("Order");

const callback = (res) => (err, doc) =>
  err
    ? res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: err.message })
    : res.status(StatusCodes.OK).send(doc);

router
  .route("/")
  .get((req, res) => {
    Order.find().exec(callback(res));
  })
  .post((req, res) => {
    console.log("HELLO!");
    Order.create({ ...req.body, deleted: false }, callback(res));
  });

router
  .route("/:id")
  .get((req, res) => {
    Order.findById(req.params.id).exec(callback(res));
  })
  .put((req, res) => {
    Order.findByIdAndUpdate(req.params.id, req.body).exec(callback(res));
  })
  .delete((req, res) => {
    Order.findByIdAndDelete(req.params.id).exec(callback(res));
  });

module.exports = router;
