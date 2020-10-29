const router = require("express").Router();
const {
  StatusCodes: { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK },
} = require("http-status-codes");
const mongoose = require("mongoose");
const Order = mongoose.model("Order");
const { check, validationResult } = require("express-validator");

/**
 * HELPER FUNCTIONS
 */

// All order table columns (except id) for insert
const handleError = (error, res) => {
  console.log(error);

  if (err.name === "ValidationError") {
    return res.status(BAD_REQUEST).json({ error: error.message });
  }

  res.status(INTERNAL_SERVER_ERROR).send({ error: "Something went wrong..." });
};

const insertOne = async (order, res) => {
  try {
    const inserted = await Order.create(order).exec();

    res.status(OK).send(inserted);
  } catch (error) {
    handleError(error, res);
  }
};

const insertMany = async (orders = [], res) => {
  if (orders.length === 0)
    return res.status(BAD_REQUEST).send({ error: "No orders to add!" });

  // TODO: validate input
  try {
    const orders = await Order.create(orders).exec();
    res.status(OK).send(orders);
  } catch (error) {
    handleError(error);
  }
};

/**
 * ROUTES
 */

router
  .route("/")
  .get(async (req, res) => {
    const { category, department } = req.query;

    try {
      const orders = await Order.find({
        department: new RegExp(department),
        category: new RegExp(category),
        deleted: false,
      }).exec();
      res.status(OK).send(orders);
    } catch (error) {
      handleError(error);
    }
  })
  .post((req, res) => {
    if (Array.isArray(req.body)) {
      insertOne(req.body, res);
    } else {
      insertMany(req.body, res);
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).exec();
      res.status(OK).send(order);
    } catch (error) {
      handleError(error);
    }
  })
  .put(async (req, res) => {
    const { id } = req.params.id;
    try {
      const order = await Order.findById(req.params.id).exec();

      if (!order) {
        return res
          .status(NOT_FOUND)
          .send({ error: `Order with id ${id} not found.` });
      }

      const {
        product_id,
        user_id,
        coupon,
        quantity,
        online,
        order_date,
        ship_date,
        status,
      } = req.body;

      if (product_id) order.product_id = product_id;
      if (user_id) order.user_id = user_id;
      if (coupon) order.coupon = coupon;
      if (quantity) order.quantity = quantity;
      if (online) order.online = online;
      if (order_date) order.order_date = order_date;
      if (ship_date) order.ship_date = ship_date;
      if (status) order.status = status;

      order.save();
      res.status(OK).send({ success: `Order ${id} successfully updated.` });
    } catch (error) {
      handleError(error);
    }
  })
  .delete(async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).exec();

      if (!order) {
        return res
          .status(NOT_FOUND)
          .send({ error: `Order with id ${id} not found.` });
      }

      order.delete();
      res.status(OK).send({ success: `Order ${id} deleted successfully.` });
    } catch (error) {
      handleError(error);
    }
  });

module.exports = router;
