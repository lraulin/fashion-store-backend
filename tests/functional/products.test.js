process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../../server");
const should = chai.should();
const Product = mongoose.model("Product");
const mockData = require("./mockData");

chai.use(chaiHttp);

const product1 = {
  name: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
  description:
    "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
  category: "men clothing",
  department: "Men",
  photo_url: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
  wholesale_price_cents: 10995,
  retail_price_cents: 10995,
  discountable: true,
  stock: 20,
  deleted: false,
};
const product2 = {
  name: "Mens Casual Premium Slim Fit T-Shirts ",
  description:
    "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.",
  category: "men clothing",
  department: "Men",
  photo_url:
    "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
  wholesale_price_cents: 2230,
  retail_price_cents: 2230,
  discountable: true,
  stock: 20,
  deleted: false,
};

describe("products", function () {
  beforeEach((done) => {
    Product.deleteMany({}, (err) => {
      done();
    });
  });
  it("should list ALL products on /products GET", function (done) {
    new Product(product1).save((err, product) => {
      chai
        .request(server)
        .get("/products")
        .end(function (err, res) {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body[0].should.be.a("object");
          res.body[0].should.have.property("_id", product._id.toString());
          res.body[0].should.have.property("name", product.name);
          res.body[0].should.have.property("description", product.description);
          res.body[0].should.have.property("category", product.category);
          res.body[0].should.have.property("department", product.department);
          res.body[0].should.have.property("photo_url", product.photo_url);
          res.body[0].should.have.property(
            "wholesale_price_cents",
            product.wholesale_price_cents
          );
          res.body[0].should.have.property(
            "retail_price_cents",
            product.retail_price_cents
          );
          res.body[0].should.have.property(
            "discountable",
            product.discountable
          );
          res.body[0].should.have.property("stock", product.stock);
          done();
        });
    });
  });
  it("should list a SINGLE product on /product/<id> GET", function (done) {
    new Product(product1).save((err, product) => {
      chai
        .request(server)
        .get("/products/" + product.id)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("_id").equals(product._id.toString());
          res.body.should.have.property("name", product.name);
          res.body.should.have.property("description", product.description);
          res.body.should.have.property("category", product.category);
          res.body.should.have.property("department", product.department);
          res.body.should.have.property("photo_url", product.photo_url);
          res.body.should.have.property(
            "wholesale_price_cents",
            product.wholesale_price_cents
          );
          res.body.should.have.property(
            "retail_price_cents",
            product.retail_price_cents
          );
          res.body.should.have.property("discountable", product.discountable);
          res.body.should.have.property("stock", product.stock);
          done();
        });
    });
  });
  it("should add a SINGLE product on /products POST when a single product is provided", function (done) {
    const requestBody = product1;

    chai
      .request(server)
      .post("/products")
      .send(requestBody)
      .end(function (err, res) {
        res.should.have.status(201);
        res.body.should.have.property("_id");
        res.body.should.have.property("name", requestBody.name);
        res.body.should.have.property("description", requestBody.description);
        res.body.should.have.property("category", requestBody.category);
        res.body.should.have.property("department", requestBody.department);
        res.body.should.have.property("photo_url", requestBody.photo_url);
        res.body.should.have.property(
          "wholesale_price_cents",
          requestBody.wholesale_price_cents
        );
        res.body.should.have.property(
          "retail_price_cents",
          requestBody.retail_price_cents
        );
        res.body.should.have.property("discountable", requestBody.discountable);
        res.body.should.have.property("stock", requestBody.stock);
        done();
      });
  });
  it("should add MULTIPLE products on /products POST when an array is provided", function (done) {
    const requestBody = [product1, product2];
    chai
      .request(server)
      .post("/products")
      .send(requestBody)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.forEach((product) => {
          product.should.have.property("_id");
          product.should.have.property("name").that.is.a("string");
          product.should.have.property("description").that.is.a("string");
          product.should.have.property("category").that.is.a("string");
          product.should.have.property("department").that.is.a("string");
          product.should.have.property("photo_url").that.is.a("string");
          product.should.have
            .property("wholesale_price_cents")
            .that.is.a("number");
          product.should.have
            .property("retail_price_cents")
            .that.is.a("number");
          product.should.have.property("discountable").that.is.a("boolean");
          product.should.have.property("stock").that.is.a("number");
        });
        done();
      });
  });
  it("should update a SINGLE product on /product/<id> PUT", function (done) {
    const requestBody = {
      name: "New Name",
      wholesale_price_cents: 5004,
      discountable: false,
    };

    new Product(product1).save((err, product) => {
      chai
        .request(server)
        .put("/products/" + product._id)
        .send(requestBody)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property(
            "success",
            `Product ${product._id} successfully updated.`
          );
          done();
        });
    });
  });
  it("should delete a SINGLE product on /product/<id> DELETE", function (done) {
    new Product(product1).save((err, product) => {
      chai
        .request(server)
        .delete("/products/" + product._id)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property(
            "success",
            `Product ${product._id} deleted successfully.`
          );
          done();
        });
    });
  });
});
