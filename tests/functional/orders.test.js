process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../../server");
const should = chai.should();
const Order = mongoose.model("Order");

chai.use(chaiHttp);

const order1 = {
  items: [
    {
      product_id: "OEU20420THND",
      quantity: 2,
    },
    { product_id: "754947954654594769", quantity: 5 },
  ],
  user_id: "572548784584",
  coupon_code: "EK24O5",
  in_store: false,
  date: new Date().toISOString(),
  ship_date: null,
  status: "placed",
};

const order2 = {
  items: [
    {
      product_id: "54754878454",
      quantity: 1,
    },
  ],
  user_id: "65545878456425",
  coupon_code: "OUT02EOU",
  in_store: false,
  date: new Date().toISOString(),
  ship_date: new Date().toISOString(),
  status: "processing",
};

describe("orders", function () {
  beforeEach((done) => {
    Order.deleteMany()
      .then((res) => {
        done();
      })
      .catch((err) => {
        throw err;
      });
  });
  it("should list ALL orders on /orders GET", (done) => {
    new Order(order1)
      .save()
      .then((order) => {
        chai
          .request(server)
          .get("/orders")
          .then((res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body[0].should.be.a("object");
            res.body[0].should.have.property("_id", order._id.toString());
            res.body[0].should.have.property("user_id", order.user_id);
            res.body[0].should.have.property("coupon_code", order.coupon_code);
            res.body[0].should.have.property("in_store", order.in_store);
            res.body[0].should.have.property("date", order.date.toISOString());
            res.body[0].should.have.property("ship_date");
            if (order.ship_date === null)
              (res.body[0].ship_date === null).should.be.true;
            else
              res.body[0].ship_date.should.strictEqual(
                order.ship_date.toISOString()
              );
            res.body[0].should.have.property("status", order.status);
            res.body[0].should.have.property("items").that.is.a("array");
            res.body[0].items[0].should.have.property(
              "product_id",
              order.items[0].product_id
            );
            res.body[0].items[0].should.have.property(
              "quantity",
              order.items[0].quantity
            );
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
  it("should list a SINGLE order on /order/<id> GET", (done) => {
    new Order(order1)
      .save()
      .then((order) => {
        chai
          .request(server)
          .get("/orders/" + order.id)
          .then((res) => {
            res.should.have.status(200);
            res.body.should.have.property("_id", order._id.toString());
            res.body.should.have.property("user_id", order.user_id);
            res.body.should.have.property("coupon_code", order.coupon_code);
            res.body.should.have.property("in_store", order.in_store);
            res.body.should.have.property("date", order.date.toISOString());
            if (order.ship_date)
              res.body.should.have.property(
                "ship_date",
                order.ship_date.toISOString()
              );
            res.body.should.have.property("status", order.status);
            res.body.should.have.property("items").that.is.a("array");
            res.body.items[0].should.have.property(
              "product_id",
              order.items[0].product_id
            );
            res.body.items[0].should.have.property(
              "quantity",
              order.items[0].quantity
            );
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
  it("should add a SINGLE order on /orders POST when a single order is provided", (done) => {
    const requestBody = order1;

    chai
      .request(server)
      .post("/orders")
      .send(requestBody)
      .then((res) => {
        res.should.have.status(201);
        res.body.should.have.property("_id");
        res.body.should.have.property("user_id", requestBody.user_id);
        res.body.should.have.property("coupon_code", requestBody.coupon_code);
        res.body.should.have.property("in_store", requestBody.in_store);
        res.body.should.have.property("date", requestBody.date);
        res.body.should.have.property("ship_date", requestBody.ship_date);
        res.body.should.have.property("status", requestBody.status);
        res.body.should.have.property("items").that.is.a("array");
        res.body.items[0].should.have.property(
          "product_id",
          requestBody.items[0].product_id
        );
        res.body.items[0].should.have.property(
          "quantity",
          requestBody.items[0].quantity
        );
        done();
      })
      .catch((err) => {
        throw err;
      });
  });
  it("should add MULTIPLE orders on /orders POST when an array is provided", (done) => {
    const requestBody = [order1, order2];
    chai
      .request(server)
      .post("/orders")
      .send(requestBody)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.forEach((order) => {
          order.should.have.property("_id", order._id.toString());
          order.should.have.property("user_id", order.user_id);
          order.should.have.property("coupon_code", order.coupon_code);
          order.should.have.property("in_store", order.in_store);
          order.should.have.property("date", order.date);
          order.should.have.property("ship_date", order.ship_date);
          order.should.have.property("status", order.status);
          order.should.have.property("items", order.items).that.is.a("array");
          order.items[0].should.have.property(
            "product_id",
            order.items[0].product_id
          );
          order.items[0].should.have.property(
            "quantity",
            order.items[0].quantity
          );
        });
        done();
      })
      .catch((err) => {
        throw err;
      });
  });
  it("should update a SINGLE order on /order/<id> PUT", (done) => {
    const requestBody = {
      ship_date: new Date(),
      status: "shipped",
    };

    new Order(order1)
      .save()
      .then((order) => {
        chai
          .request(server)
          .put("/orders/" + order._id)
          .send(requestBody)
          .then((res) => {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property(
              "success",
              `Order ${order._id} successfully updated.`
            );
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
  it("should delete a SINGLE order on /order/<id> DELETE", (done) => {
    new Order(order1)
      .save()
      .then((order) => {
        chai
          .request(server)
          .delete("/orders/" + order._id)
          .then((res) => {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property(
              "success",
              `Order ${order._id} deleted successfully.`
            );
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
  it("should return error on /order/<id> DELETE with invalid ID", (done) => {
    const fakeId = "1234567890abc15aa4b58a18";
    chai
      .request(server)
      .delete("/orders/" + fakeId)
      .then((res) => {
        res.should.have.status(404);
        res.body.should.be.a("object");
        res.body.should.have.property(
          "error",
          `Order with id ${fakeId} not found.`
        );
        done();
      })
      .catch((err) => {
        throw err;
      });
  });
});
