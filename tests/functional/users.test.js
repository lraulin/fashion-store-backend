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
  beforeEach((done) => {
    User.deleteMany()
      .then((res) => {
        done();
      })
      .catch((err) => {
        throw err;
      });
  });
  it("should register a new user with POST /users/register ", (done) => {
    const newUser = {
      username: "Sterling Malory 'Duchess' Archer",
      password: "Passw0rd!",
    };
    chai
      .request(server)
      .post("/users/register")
      .send(newUser)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.have.property("success", true);
        res.body.should.have.property("token");
        const jwtRx = /^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
        jwtRx.test(res.body.token).should.be.true;
        res.body.should.have.property("expiresIn");
        res.body.should.have.property("user");
        res.body.user.should.have.property("_id");
        res.body.user.should.have.property("username", newUser.username);
        done();
      })
      .catch((err) => {
        throw err;
      });
  });
  it("should validate an existing user and issue a JWT with POST /users/login", (done) => {
    const username = "Cyrill Figgis";
    const password = "guest";
    const { salt, hash } = utils.genPassword(password);
    new User({ username, hash, salt })
      .save()
      .then((user) => {
        chai
          .request(server)
          .post("/users/login")
          .send({ username, password })
          .then((res) => {
            res.should.have.status(200);
            done();
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  });
  it("should return user details with GET /users/:id", (done) => {
    const username = "Cyrill Figgis";
    const password = "guest";
    const { salt, hash } = utils.genPassword(password);
    new User({ username, hash, salt })
      .save()
      .then((user) => {
        chai
          .request(server)
          .get("/users/" + user._id)
          .then((res) => {
            res.should.have.status(200);
            res.body.should.have.property("success", true);
            res.body.should.have.property("user");
            res.body.user.should.have.property("_id");
            res.body.user.should.have.property("username", username);
            done();
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  });
});
