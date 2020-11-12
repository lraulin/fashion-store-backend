process.env.NODE_ENV = "test";

const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../../server");
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
  before(async function () {
    console.log("BEFORE EACH");
    this.timeout(5000);
    try {
      await Order.deleteMany({}).exec();
    } catch (error) {
      console.log(error);
    }
  });

  it("should list ALL orders on /orders GET", async function () {
    console.log(this.title);
    const order = await new Order(order1).save();
    const res = await chai.request(server).get("/orders");
    expect(res).to.have.status(200);
    expect(res.body).to.be.a("array");
    expect(res.body[0]).to.be.a("object");
    expect(res.body[0]).to.have.property("_id", order._id.toString());
    expect(res.body[0]).to.have.property("user_id", order.user_id);
    expect(res.body[0]).to.have.property("coupon_code", order.coupon_code);
    expect(res.body[0]).to.have.property("in_store", order.in_store);
    expect(res.body[0]).to.have.property("date", order.date.toISOString());
    expect(res.body[0]).to.have.property("ship_date");
    if (order.ship_date === null) expect(res.body[0].ship_date).to.be.null;
    else
      expect(res.body[0].ship_date).to.strictEqual(
        order.ship_date.toISOString()
      );
    expect(res.body[0]).to.have.property("status", order.status);
    expect(res.body[0]).to.have.property("items").that.is.a("array");
    expect(res.body[0].items[0]).to.have.property(
      "product_id",
      order.items[0].product_id
    );
    expect(res.body[0].items[0]).to.have.property(
      "quantity",
      order.items[0].quantity
    );
  });

  it("should list a SINGLE order on /order/<id> GET", async function () {
    console.log(this.title);
    const order = await new Order(order1).save();
    const res = await chai.request(server).get("/orders/" + order.id);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("_id", order._id.toString());
    expect(res.body).to.have.property("user_id", order.user_id);
    expect(res.body).to.have.property("coupon_code", order.coupon_code);
    expect(res.body).to.have.property("in_store", order.in_store);
    expect(res.body).to.have.property("date", order.date.toISOString());
    if (order.ship_date)
      expect(res.body).to.have.property(
        "ship_date",
        order.ship_date.toISOString()
      );
    expect(res.body).to.have.property("status", order.status);
    expect(res.body).to.have.property("items").that.is.a("array");
    expect(res.body.items[0]).to.have.property(
      "product_id",
      order.items[0].product_id
    );
    expect(res.body.items[0]).to.have.property(
      "quantity",
      order.items[0].quantity
    );
  });

  it("should add a SINGLE order on /orders POST when a single order is provided", async function () {
    console.log(this.title);
    const requestBody = order1;

    const res = await chai.request(server).post("/orders").send(requestBody);
    expect(res).to.have.status(201);
    expect(res.body).to.have.property("_id");
    expect(res.body).to.have.property("user_id", requestBody.user_id);
    expect(res.body).to.have.property("coupon_code", requestBody.coupon_code);
    expect(res.body).to.have.property("in_store", requestBody.in_store);
    expect(res.body).to.have.property("date", requestBody.date);
    expect(res.body).to.have.property("ship_date", requestBody.ship_date);
    expect(res.body).to.have.property("status", requestBody.status);
    expect(res.body).to.have.property("items").that.is.a("array");
    expect(res.body.items[0]).to.have.property(
      "product_id",
      requestBody.items[0].product_id
    );
    expect(res.body.items[0]).to.have.property(
      "quantity",
      requestBody.items[0].quantity
    );
  });

  it("should add MULTIPLE orders on /orders POST when an array is provided", async function () {
    console.log(this.title);
    const requestBody = [order1, order2];
    const res = await chai.request(server).post("/orders").send(requestBody);
    expect(res).to.have.status(200);
    expect(res.body).to.be.a("array");
    res.body.forEach((order) => {
      expect(order).to.have.property("_id", order._id.toString());
      expect(order).to.have.property("user_id", order.user_id);
      expect(order).to.have.property("coupon_code", order.coupon_code);
      expect(order).to.have.property("in_store", order.in_store);
      expect(order).to.have.property("date", order.date);
      expect(order).to.have.property("ship_date", order.ship_date);
      expect(order).to.have.property("status", order.status);
      expect(order).to.have.property("items", order.items).that.is.a("array");
      expect(order.items[0]).to.have.property(
        "product_id",
        order.items[0].product_id
      );
      expect(order.items[0]).to.have.property(
        "quantity",
        order.items[0].quantity
      );
    });
  });

  it("should update a SINGLE order on /order/<id> PUT", async function () {
    console.log(this.title);
    const requestBody = {
      ship_date: new Date(),
      status: "shipped",
    };

    const order = await new Order(order1).save();
    console.log("should update", order._id);
    const res = await chai
      .request(server)
      .put("/orders/" + order._id)
      .send(requestBody);
    expect(res).to.have.status(200);
    expect(res.body).to.be.a("object");
    expect(res.body).to.have.property(
      "success",
      `Order ${order._id} successfully updated.`
    );
  });

  it("should delete a SINGLE order on /order/<id> DELETE", async function () {
    console.log(this.title);
    const order = await new Order(order1).save();
    console.log("should delete", order._id);
    const res = await chai.request(server).delete("/orders/" + order._id);
    expect(res).to.have.status(200);
    expect(res.body).to.be.a("object");
    expect(res.body).to.have.property(
      "success",
      `Order ${order._id} deleted successfully.`
    );
  });

  it("should return error on /order/<id> DELETE with invalid ID", async function () {
    const fakeId = "1234567890abc15aa4b58a18"; // Valid ObjectID string but not in database
    const res = await chai.request(server).delete("/orders/" + fakeId);
    console.log("should fail delete", fakeId);
    expect(res).to.have.status(404);
    expect(res.body).to.be.a("object");
    expect(res.body).to.have.property(
      "error",
      `Order with id ${fakeId} not found.`
    );
  });
});
