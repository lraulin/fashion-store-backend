const router = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const Order = mongoose.model("Order");

/**
 * HELPER FUNCTIONS
 */

// All order table columns (except id) for insert
const handleError = (error, res) => {
  console.log(error);

  if (error.name === "ValidationError") {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }

  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send({ error: "Something went wrong..." });
};

const insertOne = async (order, res) => {
  try {
    const inserted = await Order.create(order);

    res.status(StatusCodes.CREATED).send(inserted);
  } catch (error) {
    handleError(error, res);
  }
};

const insertMany = async (orders = [], res) => {
  if (orders.length === 0)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ error: "No orders to add!" });

  // TODO: validate input
  try {
    const docs = await Order.create(orders);
    res.status(StatusCodes.OK).send(docs);
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
    try {
      const query = Order.find();
      const orders = await query.exec();
      res.status(StatusCodes.OK).send(orders);
    } catch (error) {
      handleError(error, res);
    }
  })
  .post((req, res) => {
    if (Array.isArray(req.body)) {
      insertMany(req.body, res);
    } else {
      insertOne(req.body, res);
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).exec();
      res.status(StatusCodes.OK).send(order);
    } catch (error) {
      handleError(error, res);
    }
  })
  .put(async (req, res) => {
    const { id } = req.params;
    try {
      const order = await Order.findById(req.params.id).exec();

      if (!order) {
        return res
          .status(StatusCodes.NOT_FOUND)
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
      res
        .status(StatusCodes.OK)
        .send({ success: `Order ${id} successfully updated.` });
    } catch (error) {
      handleError(error, res);
    }
  })
  .delete(async (req, res) => {
    const { id } = req.params;
    try {
      const deletedItem = await Order.findByIdAndDelete(req.params.id);
      if (!deletedItem)
        return res
          .status(StatusCodes.NOT_FOUND)
          .send({ error: `Order with id ${id} not found.` });

      res
        .status(StatusCodes.OK)
        .send({ success: `Order ${id} deleted successfully.` });
    } catch (error) {
      if (error.name === "CastError")
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send({ error: `${id} is not a valid ID.` });
      else handleError(error, res);
    }
  });

module.exports = router;
