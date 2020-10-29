const router = require("express").Router();
const {
  StatusCodes: { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND },
} = require("http-status-codes");
const mongoose = require("mongoose");
const Coupon = mongoose.model("Coupon");

/**
 * Helper functions.
 */

const callback = (res) => (err, doc) =>
  err
    ? res.status(INTERNAL_SERVER_ERROR).send({ error: err.message })
    : res.status(OK).send(doc);

const genericErrorMessage = "Something went wrong...";
const invalidReqBodyMessage = "Fields 'code' and 'discount' are required.";

const createOne = ({ code, discount, expiration_date }, res) => {
  if (!code || !discount)
    return res.status(BAD_REQUEST).send({ error: invalidReqBodyMessage });
  Coupon.create(
    { code, discount, expiration_date, valid: true },
    callback(res)
  );
};

const createMany = (coupons = [], res) => {
  const couponsToCreate = req.body.map((x) => {
    if (!x.code || !x.discount)
      return res.status(BAD_REQUEST).send({ error: invalidReqBodyMessage });
    return {
      code: x.code,
      discount: x.discount,
      expiration_date: x.expiration_date,
      valid: true,
    };
  });
  Coupon.create(couponsToCreate, callback(res));
};

const updateOne = async (code, { discount, expiration_date, valid }, res) => {
  if (!discount && !expiration_date && !valid)
    return res.status(BAD_REQUEST).send({ error: "No fields given to update" });

  try {
    const coupon = await Coupon.find({ code }).exec();

    if (!coupon)
      return res
        .status(NOT_FOUND)
        .send({ error: "No coupon found with code " + code });

    if (discount) coupon.discount = discount;
    if (expiration_date) coupon.expiration_date = expiration_date;
    if (valid === true || valid === false) coupon.value = value;

    await coupon.save();
    res.status(OK).send({ success: `Coupon ${code} successfully updated!` });
  } catch (error) {
    console.log(error);
    res.status(INTERNAL_SERVER_ERROR).send({ error: genericErrorMessage });
  }
};

const deleteByCode = (code, res) =>{
try {
    const coupon = await Coupon.find({ code }).exec();

    if (!coupon)
      return res
        .status(NOT_FOUND)
        .send({ error: "No coupon found with code " + code });

    await coupon.delete();
    res.status(OK).send({ success: `Coupon ${code} successfully deleted!` });
  } catch (error) {
    console.log(error);
    res.status(INTERNAL_SERVER_ERROR).send({ error: genericErrorMessage });
  }
}

/**
 * Routes /coupon
 */

router
  .route("/")
  .get((req, res) => {
    Coupon.find().exec(callback(res));
  })
  .post((req, res) => {
    if (Array.isArray(req.body)) {
      const coupons = req.body;
      createMany(coupons, res);
    } else {
      const coupon = req.body;
      createOne(coupon, res);
    }
  });

router
  .route("/:code")
  .get((req, res) => {
    Coupon.findById(req.params.id).exec(callback(res));
  })
  .put((req, res) => {
    updateOne(req.params.code, req.body, res);
  })
  .delete((req, res) => {
    deleteByCode(req.params.code, res)
  });

module.exports = router;
