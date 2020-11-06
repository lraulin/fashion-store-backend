process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../../server");
const should = chai.should();
const User = mongoose.model("User");
const utils = require("../../lib/utils");

chai.use(chaiHttp);

describe("users", function () {
  beforeEach(async () => {
    try {
      await User.deleteMany();
    } catch (err) {
      throw err;
    }
  });

  it("should register a new user with POST /users/register ", async () => {
    const newUser = {
      username: "Sterling Malory 'Duchess' Archer",
      password: "Passw0rd!",
    };
    try {
      const res = await chai
        .request(server)
        .post("/users/register")
        .send(newUser);
      res.should.have.status(200);
      res.body.should.have.property("success", true);
      res.body.should.have.property("token");
      const jwtRx = /^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
      jwtRx.test(res.body.token).should.be.true;
      res.body.should.have.property("expiresIn");
      res.body.should.have.property("user");
      res.body.user.should.have.property("_id");
      res.body.user.should.have.property("username", newUser.username);
    } catch (err) {
      throw err;
    }
  });

  it("should validate an existing user and issue a JWT with POST /users/login", async () => {
    const username = "Cyrill Figgis";
    const password = "guest";
    const { salt, hash } = utils.genPassword(password);
    try {
      const user = await new User({ username, hash, salt }).save();
      const res = await chai
        .request(server)
        .post("/users/login")
        .send({ username, password });
      res.should.have.status(200);
    } catch (err) {
      throw err;
    }
  });

  it("should return user details with GET /users/:id", async () => {
    const username = "Cyrill Figgis";
    const password = "guest";
    const { salt, hash } = utils.genPassword(password);
    try {
      const user = await new User({ username, hash, salt }).save();
      const res = await chai.request(server).get("/users/" + user._id);
      res.should.have.status(200);
      res.body.should.have.property("success", true);
      res.body.should.have.property("user");
      res.body.user.should.have.property("_id");
      res.body.user.should.have.property("username", username);
    } catch (err) {
      throw err;
    }
  });
});
