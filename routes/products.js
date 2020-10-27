const router = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const Product = mongoose.model("Product");

// All product table columns (except id) for insert
const productTableColumns =
  "name description category department photo_url wholesale_price_cents retail_price_cents discountable stock deleted";

router
  .route("/")
  .get((request, response) => {
    const category = request.query.category;
    const department = request.query.department;
    Product.find({
      department: new RegExp(department),
      category: new RegExp(category),
      deleted: false,
    })
      .select(productTableColumns)
      .exec((err, doc) =>
        err
          ? response
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .send({ error: err.message })
          : response.status(StatusCodes.OK).send(doc)
      );
  })
  .post((request, response) => {
    if (Array.isArray(request.body)) {
      Product.insertMany(request.body)
        .then((docs) => response.status(StatusCodes.OK).send(docs))
        .catch((e) =>
          response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e)
        );
    } else {
      Product.create({ ...request.body, deleted: false }).exec(
        (error, results) => {
          if (error || results.affectedRows == 0) {
            response.status(400);
            response.send();
          } else {
            response.status(201);
            response.send();
          }
        }
      );
    }
  });

router
  .route("/:id")
  .get((request, response) => {
    const { id } = request.params;
    Product.findById(id).exec((error, results) => {
      err
        ? response
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send({ error: err.message })
        : response.status(StatusCodes.OK).send(doc);
    });
  })
  .put((request, response) => {
    Product.findByIdAndUpdate(request.params.id, request.body).exec(
      (error, results) => {
        if (error || results.affectedRows == 0) {
          response.status(400);
          response.send();
        } else {
          response.status(204);
          response.send();
        }
      }
    );
  })
  .delete((request, response) => {
    Product.findByIdAndDelete(request.params.id).exec((error, results) => {
      if (error || results.affectedRows == 0) {
        response.status(400);
        response.send();
      } else {
        response.status(204);
        response.send();
      }
    });
  });

module.exports = router;
