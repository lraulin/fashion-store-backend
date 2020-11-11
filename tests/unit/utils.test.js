process.env.NODE_ENV = "test";

const chai = require("chai");
const crypto = require("crypto");
const should = chai.should();
const { validPassword, issueJWT } = require("../../lib/utils");

describe("utils", () => {
  describe("#validPassword", () => {
    it("should return true when given a password with matching salt and hash", (done) => {
      const password = "Passw0rd!";
      const salt = crypto.randomBytes(32).toString("hex");
      const hash = crypto
        .pbkdf2Sync(password, salt, 10000, 64, "sha512")
        .toString("hex");

      const actual = validPassword(password, hash, salt);
      actual.should.be.true;
      done();
    });

    it("should return false when given a password with non-matching salt and hash", (done) => {
      const password = "Passw0rd!";
      const notPassword = "pA$$word1";
      const salt = crypto.randomBytes(32).toString("hex");
      const hash = crypto
        .pbkdf2Sync(password, salt, 10000, 64, "sha512")
        .toString("hex");

      const actual = validPassword(notPassword, hash, salt);
      actual.should.be.false;
      done();
    });
  });

  describe("#issueJWT", () => {
    it("should return an object with a token", (done) => {
      const user = { _id: "5fa5986128a18646a8788f3c" };
      const tokenRx = /^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
      const actual = issueJWT(user);
      actual.should.have.property("token");
      tokenRx.test(actual.token).should.be.true;
      done();
    });
  });
});
