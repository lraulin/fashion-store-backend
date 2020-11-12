process.env.NODE_ENV = "test";

const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../../server");
const User = mongoose.model("User");
const utils = require("../../lib/utils");

chai.use(chaiHttp);

describe("users", function () {
  before(async function () {
    this.timeout(5000);
    await User.deleteMany();
  });

  it("should register a new user with POST /users/register ", async () => {
    const newUser = {
      username: "Sterling Malory 'Duchess' Archer",
      password: "Passw0rd!",
    };
    const res = await chai
      .request(server)
      .post("/users/register")
      .send(newUser);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("success", true);
    expect(res.body).to.have.property("token");
    const jwtRx = /^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
    expect(jwtRx.test(res.body.token)).to.be.true;
    expect(res.body).to.have.property("expiresIn");
    expect(res.body).to.have.property("user");
    expect(res.body.user).to.have.property("_id");
    expect(res.body.user).to.have.property("username", newUser.username);
  });

  it("should validate an existing user and issue a JWT with POST /users/login", async () => {
    const username = "Cyrill Figgis";
    const password = "guest";
    const { salt, hash } = utils.genPassword(password);
    const user = await new User({ username, hash, salt }).save();
    const res = await chai
      .request(server)
      .post("/users/login")
      .send({ username, password });
    expect(res).to.have.status(200);
  });

  it("should return user details with GET /users/:id", async () => {
    const username = "Cyrill Figgis";
    const password = "guest";
    const { salt, hash } = utils.genPassword(password);
    const user = await new User({ username, hash, salt }).save();
    const res = await chai.request(server).get("/users/" + user._id);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("success", true);
    expect(res.body).to.have.property("user");
    expect(res.body.user).to.have.property("_id");
    expect(res.body.user).to.have.property("username", username);
  });
});
