process.env.NODE_ENV = "test";

const chai = require("chai");
const { expect } = chai;
const crypto = require("crypto");
const { validPassword, issueJWT, genPassword } = require("../../lib/utils");

describe("utils", () => {
  describe("#validPassword", () => {
    it("should return true when given a password with matching salt and hash", (done) => {
      const password = "Passw0rd!";
      const salt = crypto.randomBytes(32).toString("hex");
      const hash = crypto
        .pbkdf2Sync(password, salt, 10000, 64, "sha512")
        .toString("hex");

      const actual = validPassword(password, hash, salt);
      expect(actual).to.be.true;
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
      expect(actual).to.be.false;
      done();
    });
  });

  describe("#genPassword", () => {
    it("should return an object with a salt that is a 32 bit hex string", (done) => {
      const { salt } = genPassword("Pa$$w0rd!");
      expect(salt).to.be.a("string");
      const hexRx = /[0-9a-f]{32}/;
      expect(hexRx.test(salt)).to.be.true;
      done();
    });

    it("should return an object with a valid hash", (done) => {
      const password = "Pa$$w0rd!";
      const { salt, hash } = genPassword(password);
      const expectedHash = crypto
        .pbkdf2Sync(password, salt, 10000, 64, "sha512")
        .toString("hex");
      expect(hash).to.equal(expectedHash);
      done();
    });
  });

  describe("#issueJWT", () => {
    it("should return an object with a token", (done) => {
      const user = { _id: "5fa5986128a18646a8788f3c" };
      const tokenRx = /^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
      const actual = issueJWT(user);
      expect(actual).to.have.property("token");
      expect(tokenRx.test(actual.token)).to.be.true;
      done();
    });
    it("should return an object with an expiration of '1d'", (done) => {
      const user = { _id: "5fa5986128a18646a8788f3c" };
      const actual = issueJWT(user);
      expect(actual).to.have.property("expires", "1d");
      done();
    });
  });
});
