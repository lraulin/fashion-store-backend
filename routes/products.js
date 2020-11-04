const router = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const Product = mongoose.model("Product");

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

    try {
      const query = Product.find().select(productTableColumns);

      // optionally filter results using query parameters
      if (nameIncludes) query.where("name").includes(nameIncludes);
      if (category) query.where("category").includes(category);
      if (department) query.where("department").includes(department);
      if (inStock === "true") query.where("stock").gt(0);

      // optionally sort results using query parameters
      if (sort) query.sort(sort);

      // optionally paginate results using query parameters
      const limit = req.query.limit ? Number.parseInt(req.query.limit) : 50;
      const page = req.query.page ? Number.parseInt(req.query.page) : 1;
      const pageOptions = {
        limit,
        page,
      };
      // if (limit) query.limit(limit);
      // if (skip) query.skip(skip);

      query.select(productTableColumns);
      const {
        docs,
        totalDocs,
        totalPages: lastPage,
        nextPage,
      } = await Product.paginate(query, pageOptions);

      const url = "";

      // .set("Link", req.originalUrl + "?page=" + lastPage + "&limit=" + limit)
      res
        .status(StatusCodes.OK)
        .links({
          next: `${req.originalUrl}?page=${nextPage}&limit=${limit}`,
          last: `${req.originalUrl}?page=${lastPage}&limit=${limit}`,
        })
        .set("FashionStore-Total-Count", totalDocs)
        .send(docs);
    } catch (error) {
      handleError(error, res);
    }
  })

  .post((req, res) => {
    if (Array.isArray(req.body)) {
      // Send 200 response and array of inserted products as body
      insertMany(req.body, res);
    } else {
      // Send 201 response with location (/products/:id) of inserted product and item in body
      insertOne(req.body, res);
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).exec();
      res.status(StatusCodes.OK).send(product);
    } catch (error) {
      handleError(error, res);
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
      handleError(error, res);
    }
  })

  .delete(async (req, res) => {
    const { id } = req.params;
    try {
      const deletedItem = await Product.findByIdAndDelete(id);

      if (!deletedItem) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .send({ error: `Product with id ${id} not found.` });
      }

      res
        .status(StatusCodes.OK)
        .send({ success: `Product ${id} deleted successfully.` });
    } catch (error) {
      if (error.name === "CastError")
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send({ error: `${id} is not a valid ID.` });
      else handleError(error, res);
    }
  });

module.exports = router;
