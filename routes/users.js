const mongoose = require("mongoose");
const router = require("express").Router();
const {
  StatusCodes: {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
    UNAUTHORIZED,
  },
} = require("http-status-codes");
const User = mongoose.model("User");
const passport = require("passport");
const utils = require("../lib/utils");

const handleError = (error, res) => {
  console.log(error);
  res
    .status(INTERNAL_SERVER_ERROR)
    .send({ success: false, message: "Something went wrong..." });
};

// Validate an existing user and issue a JWT
router.route("/login").post(async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res
        .status(NOT_FOUND)
        .send({ success: false, message: "could not find user" });
    }

    // Function defined at bottom of app.js
    const isValid = utils.validPassword(
      req.body.password,
      user.hash,
      user.salt
    );

    if (!isValid) {
      return res
        .status(UNAUTHORIZED)
        .send({ success: false, message: "you entered the wrong password" });
    }

    const { _id, username, firstName, lastName, address, phone } = user;

    const tokenObject = utils.issueJWT(user);
    res.status(OK).send({
      success: true,
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
      user: { _id, username, firstName, lastName, address, phone },
    });
  } catch (error) {
    handleError(error, res);
  }
});

router.route("/register").post(async (req, res) => {
  const saltHash = utils.genPassword(req.body.password);

  const salt = saltHash.salt;
  const hash = saltHash.hash;
  try {
    const newUser = new User({
      username: req.body.username,
      hash: hash,
      salt: salt,
    });

    const user = await newUser.save();
    const tokenObject = utils.issueJWT(user);

    const { _id, username, firstName, lastName, address, phone } = user;

    res.status(OK).send({
      success: true,
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
      user: { _id, username, firstName, lastName, address, phone },
    });
  } catch (error) {
    handleError(error, res);
  }
});

router.route("/").get((res, req) => {
  //
});

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select("-__v -hash -salt")
        .exec();
      res.status(OK).send({ success: true, user });
    } catch (error) {
      handleError(error);
    }
  })
  .put(async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select("-__v -hash -salt")
        .exec();

      if (!user) {
        return res
          .status(NOT_FOUND)
          .send({ error: `User with id ${id} not found.` });
      }

      if (req.body.firstName) user.firstName = req.body.firstName;
      if (req.body.lastName) user.lastName = req.body.lastName;
      if (req.body.phone) user.phone = req.body.phone;
      if (req.body.address) user.address = req.body.address;

      user.save();
      res.status(OK).send({ success: true, user });
    } catch (error) {
      handleError(error);
    }
  })
  .delete(async (req, res) => {
    try {
      const user = await User.findById(req.params.id).exec();

      if (!user) {
        return res
          .status(NOT_FOUND)
          .send({ success: false, message: `User with id ${id} not found.` });
      }

      user.delete();
      res
        .status(OK)
        .send({ success: false, message: `User ${id} deleted successfully.` });
    } catch (error) {
      handleError(error);
    }
  });

module.exports = router;
