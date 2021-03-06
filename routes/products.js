const router = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const Product = mongoose.model("Product");
const { check, validationResult } = require("express-validator");

/**
 * HELPER FUNCTIONS
 */

// All product table columns (except id) for insert
const productTableColumns =
  "name description category department photo_url wholesale_price_cents retail_price_cents discountable stock deleted";

const handleError = (error, res) => {
  console.log(error);

  if (error.name === "ValidationError") {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }

  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send({ error: "Something went wrong..." });
};

const insertOne = async (product, res) => {
  try {
    const inserted = await Product.create(product);

    console.log("Sending response");
    res
      .status(StatusCodes.CREATED)
      .location("/products/" + inserted._id)
      .send(inserted);
  } catch (error) {
    handleError(error, res);
  }
};

const insertMany = async (products = [], res) => {
  if (products.length === 0)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ error: "No products to add!" });

  // TODO: validate input
  try {
    const createdProducts = await Product.create(products);
    res.status(StatusCodes.OK).send(createdProducts);
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * ROUTES
 */

router
  .route("/")
  .get(async (req, res) => {
    // Construct match criteria from query parameters
    const { nameIncludes, category, department, inStock, sort } = req.query;
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : null;
    const skip = req.query.skip ? Number.parseInt(req.query.skip) : null;

    try {
      const query = Product.find().select(productTableColumns);

      // optionally filter results using query parameters
      if (nameIncludes) query.where("name").includes(nameIncludes);
      if (category) query.where("category").includes(category);
      if (department) query.where("department").includes(department);
      if (inStock === "true") query.where("stock").gt(0);

      // optionally paginate results using query parameters
      if (limit) query.limit(limit);
      if (skip) query.skip(skip);

      // optionally sort results using query parameters
      if (sort) query.sort(sort);

      query.select(productTableColumns);
      const products = await query.exec();
      res.status(StatusCodes.OK).send(products);
    } catch (error) {
      handleError(error);
    }
  })

  .post((req, res) => {
    if (!Array.isArray(req.body)) {
      insertOne(req.body, res);
    } else {
      insertMany(req.body, res);
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).exec();
      res.status(StatusCodes.OK).send(product);
    } catch (error) {
      handleError(error);
    }
  })

  .put(async (req, res) => {
    const { id } = req.params.id;
    try {
      const product = await Product.findById(req.params.id).exec();

      if (!product) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .send({ error: `Product with id ${id} not found.` });
      }

      const {
        name,
        description,
        category,
        department,
        photo_url,
        wholesale_price_cents,
        retail_price_cents,
        discountable,
        stock,
        deleted,
      } = req.body;

      if (name) product.name = name;
      if (description) product.description = description;
      if (category) product.category = category;
      if (department) product.department = department;
      if (photo_url) product.photo_url = photo_url;
      if (wholesale_price_cents)
        product.wholesale_price_cents = wholesale_price_cents;
      if (retail_price_cents) product.retail_price_cents = retail_price_cents;
      if (discountable) product.discountable = discountable;
      if (stock) product.stock = stock;
      if (deleted) product.deleted = deleted;

      product.save();
      res
        .status(StatusCodes.OK)
        .send({ success: `Product ${product._id} successfully updated.` });
    } catch (error) {
      handleError(error);
    }
  })

  .delete(async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).exec();

      if (!product) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .send({ error: `Product with id ${product._id} not found.` });
      }

      product.delete();
      res
        .status(StatusCodes.OK)
        .send({ success: `Product ${product._id} deleted successfully.` });
    } catch (error) {
      handleError(error);
    }
  });

module.exports = router;
