process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../../server");
const { expect } = chai;
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

describe("products", () => {
  before(async function () {
    this.timeout(5000);
    await Product.deleteMany({});
  });

  it("should list ALL products on /products GET", async () => {
    const product = await new Product(product1).save();
    const res = await chai.request(server).get("/products");
    expect(res).to.have.status(200);
    expect(res.body).to.be.a("array");
    expect(res.body[0]).to.be.a("object");
    expect(res.body[0]).to.have.property("_id", product._id.toString());
    expect(res.body[0]).to.have.property("name", product.name);
    expect(res.body[0]).to.have.property("description", product.description);
    expect(res.body[0]).to.have.property("category", product.category);
    expect(res.body[0]).to.have.property("department", product.department);
    expect(res.body[0]).to.have.property("photo_url", product.photo_url);
    expect(res.body[0]).to.have.property(
      "wholesale_price_cents",
      product.wholesale_price_cents
    );
    expect(res.body[0]).to.have.property(
      "retail_price_cents",
      product.retail_price_cents
    );
    expect(res.body[0]).to.have.property("discountable", product.discountable);
    expect(res.body[0]).to.have.property("stock", product.stock);
  });

  it("should list a SINGLE product on /product/<id> GET", async () => {
    const product = await new Product(product1).save();
    const res = await chai.request(server).get("/products/" + product.id);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("_id").equals(product._id.toString());
    expect(res.body).to.have.property("name", product.name);
    expect(res.body).to.have.property("description", product.description);
    expect(res.body).to.have.property("category", product.category);
    expect(res.body).to.have.property("department", product.department);
    expect(res.body).to.have.property("photo_url", product.photo_url);
    expect(res.body).to.have.property(
      "wholesale_price_cents",
      product.wholesale_price_cents
    );
    expect(res.body).to.have.property(
      "retail_price_cents",
      product.retail_price_cents
    );
    expect(res.body).to.have.property("discountable", product.discountable);
    expect(res.body).to.have.property("stock", product.stock);
  });

  it("should add a SINGLE product on /products POST when a single product is provided", async () => {
    const requestBody = product1;

    const res = await chai.request(server).post("/products").send(requestBody);
    expect(res).to.have.status(201);
    expect(res.body).to.have.property("_id");
    expect(res.body).to.have.property("name", requestBody.name);
    expect(res.body).to.have.property("description", requestBody.description);
    expect(res.body).to.have.property("category", requestBody.category);
    expect(res.body).to.have.property("department", requestBody.department);
    expect(res.body).to.have.property("photo_url", requestBody.photo_url);
    expect(res.body).to.have.property(
      "wholesale_price_cents",
      requestBody.wholesale_price_cents
    );
    expect(res.body).to.have.property(
      "retail_price_cents",
      requestBody.retail_price_cents
    );
    expect(res.body).to.have.property("discountable", requestBody.discountable);
    expect(res.body).to.have.property("stock", requestBody.stock);
  });

  it("should add MULTIPLE products on /products POST when an array is provided", async () => {
    const requestBody = [product1, product2];
    const res = await chai.request(server).post("/products").send(requestBody);
    expect(res).to.have.status(200);
    expect(res.body).to.be.a("array");
    res.body.forEach((product) => {
      expect(product).to.have.property("_id");
      expect(product).to.have.property("name").that.is.a("string");
      expect(product).to.have.property("description").that.is.a("string");
      expect(product).to.have.property("category").that.is.a("string");
      expect(product).to.have.property("department").that.is.a("string");
      expect(product).to.have.property("photo_url").that.is.a("string");
      expect(product)
        .to.have.property("wholesale_price_cents")
        .that.is.a("number");
      expect(product)
        .to.have.property("retail_price_cents")
        .that.is.a("number");
      expect(product).to.have.property("discountable").that.is.a("boolean");
      expect(product).to.have.property("stock").that.is.a("number");
    });
  });

  it("should update a SINGLE product on /product/<id> PUT", async () => {
    const requestBody = {
      name: "New Name",
      wholesale_price_cents: 5004,
      discountable: false,
    };
    const product = await new Product(product1).save();
    const res = await chai
      .request(server)
      .put("/products/" + product._id)
      .send(requestBody);
    expect(res).to.have.status(200);
    expect(res.body).to.be.a("object");
    expect(res.body).to.have.property(
      "success",
      `Product ${product._id} successfully updated.`
    );
  });

  it("should delete a SINGLE product on /product/<id> DELETE", async () => {
    const product = await new Product(product1).save();
    const res = await chai.request(server).delete("/products/" + product._id);
    expect(res).to.have.status(200);
    expect(res.body).to.be.a("object");
    expect(res.body).to.have.property(
      "success",
      `Product ${product._id} deleted successfully.`
    );
  });
});
