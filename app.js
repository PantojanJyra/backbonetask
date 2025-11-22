$(function () {
  // Product Model
  var Product = Backbone.Model.extend({
    defaults: {
      name: "",
      price: 0,
      image: "",
    },
  });

  // Client Model
  var Client = Backbone.Model.extend({
    defaults: {
      name: "",
      card: "",
      address: "",
    },
  });

  // Product Collection
  var ProductList = Backbone.Collection.extend({
    model: Product,
    localStorage: new Backbone.LocalStorage("Products-Storage"),
  });

  // Client Collection
  var ClientList = Backbone.Collection.extend({
    model: Client,
    localStorage: new Backbone.LocalStorage("Clients-Storage"),
  });

  // Instantiate Collections
  var Products = new ProductList();
  var Clients = new ClientList();

  // Product Item View
  var ProductItemView = Backbone.View.extend({
    tagName: "li",
    template: _.template(`
  <div style="display: flex; align-items: center; justify-content: space-between; background-color: #fff; padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <div style="display: flex; align-items: center;">
      <img src="<%- image %>" width="50" style="border-radius: 5px; margin-right: 15px;">
      <div style="flex-grow: 1; color: #333;">
        <strong style="font-size: 16px; color: #007bff;"><%- name %></strong><br>
        <span style="font-size: 14px; color: #555;">Php<%- price %></span>
      </div>
    </div>
    <div style="display: flex; align-items: center;">
      <button class="edit" style="background-color: #007bff; color: white; border: none; padding: 8px 12px; font-size: 14px; border-radius: 4px; cursor: pointer; transition: background-color 0.3s ease; margin-right: 8px;">
        Edit
      </button>
      <button class="delete" style="background-color: #e74c3c; color: white; border: none; padding: 8px 12px; font-size: 14px; border-radius: 4px; cursor: pointer; transition: background-color 0.3s ease;">
        Delete
      </button>
    </div>
  </div>
`),

    events: {
      "click .delete": "deleteProduct",
      "click .edit": "editProduct",
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    deleteProduct: function () {
      this.model.destroy();
      this.remove();
    },

    editProduct: function () {
      location.hash = "#editProduct/" + this.model.id;
    },
  });

  // Product Form View (Add/Edit Product)
  var ProductFormView = Backbone.View.extend({
    el: "#app",

    template: _.template(`
  <h2 style="text-align: center; color: #333; margin-top: 30px;"><%- editing ? "Edit" : "Add" %> Product</h2>
  <div style="background-color: #fff; width: 100%; max-width: 500px; margin: 20px auto; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
    <form>
      <div style="margin-bottom: 15px;">
        <label for="name" style="font-size: 14px; color: #555; display: block;">Name:</label>
        <input type="text" id="name" value="<%- name %>" placeholder="Enter product name" style="width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; background-color: #fafafa;">
      </div>
      <div style="margin-bottom: 15px;">
        <label for="price" style="font-size: 14px; color: #555; display: block;">Price:</label>
        <input type="number" id="price" value="<%- price %>" placeholder="Enter product price" style="width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; background-color: #fafafa;">
      </div>
      <div style="margin-bottom: 15px;">
        <label for="image" style="font-size: 14px; color: #555; display: block;">Image URL:</label>
        <input type="text" id="image" value="<%- image %>" placeholder="Enter image URL" style="width: 100%; padding: 10px; margin: 8px 0 20px; border: 1px solid #ddd; border-radius: 4px; background-color: #fafafa;">
      </div>
      <button id="save" style="background-color: #007bff; color: white; border: none; padding: 12px 20px; font-size: 16px; border-radius: 4px; width: 100%; cursor: pointer; transition: background-color 0.3s ease;">Save</button>
    </form>
    <a href="#products" style="display: inline-block; margin-top: 20px; text-align: center; color: #007bff; font-size: 14px; text-decoration: none;">Back</a>
  </div>
`),

    events: {
      "click #save": "saveProduct",
    },

    initialize: function () {
      this.editing = this.model ? true : false;
      this.render();
    },

    render: function () {
      this.$el.html(
        this.template(
          this.model
            ? {
                editing: true,
                name: this.model.get("name"),
                price: this.model.get("price"),
                image: this.model.get("image"),
              }
            : { editing: false, name: "", price: "", image: "" }
        )
      );
    },

    saveProduct: function (e) {
      e.preventDefault();
      var data = {
        name: this.$("#name").val(),
        price: parseFloat(this.$("#price").val()),
        image: this.$("#image").val(),
      };

      if (this.editing) {
        this.model.set(data).save(); // If editing, update the product
      } else {
        Products.create(data); // If adding, create a new product
      }

      location.hash = "#products"; // Redirect back to the products list
    },
  });

  // Product List View
  var ProductListView = Backbone.View.extend({
    el: "#app",
    initialize: function () {
      Products.fetch();
      this.render();
    },

    render: function () {
      var html = `
  <div style="max-width: 800px; margin: 40px auto; padding: 30px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <button id="add" style="background-color: #28a745; color: white; border: none; padding: 12px 20px; font-size: 16px; border-radius: 4px; cursor: pointer; transition: background-color 0.3s ease; width: 200px;">
        Add Product
      </button>
    </div>
    <ul id="product-list" style="list-style-type: none; padding: 0; margin-top: 20px;">
      <!-- Product list items will be dynamically added here -->
    </ul>
  </div>
`;

      this.$el.html(html);
      var ul = this.$("#product-list");

      Products.each(function (product) {
        var view = new ProductItemView({ model: product });
        ul.append(view.render().el);
      });
    },

    events: {
      "click #add": function () {
        location.hash = "#addProduct";
      },
    },
  });

  //ClientView
  var ClientItemView = Backbone.View.extend({
    tagName: "li",
    template: _.template(`
  <div style="display: flex; justify-content: space-between; align-items: center; background-color: #fff; padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <div style="flex-grow: 1; color: #333;">
      <strong style="font-size: 16px; color: #007bff;"><%- name %></strong><br>
      <span style="font-size: 14px; color: #555;"><%- card %></span><br>
      <span style="font-size: 14px; color: #555;"><%- address %></span>
    </div>
    <button class="delete" style="background-color: #e74c3c; color: white; border: none; padding: 8px 12px; font-size: 14px; border-radius: 4px; cursor: pointer; transition: background-color 0.3s ease;">Delete</button>
  </div>
`),

    events: {
      "click .delete": "deleteClient",
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    deleteClient: function () {
      this.model.destroy();
      this.remove();
    },
  });

  var ClientFormView = Backbone.View.extend({
    el: "#app",

    template: _.template(`
  <h2 style="text-align: center; color: #333; margin-top: 30px;">Add Client</h2>
  <div style="background-color: #fff; width: 100%; max-width: 500px; margin: 20px auto; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
    <form>
      <div style="margin-bottom: 15px;">
        <label for="name" style="font-size: 14px; color: #555; display: block;">Name:</label>
        <input type="text" id="name" placeholder="Enter client name" style="width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; background-color: #fafafa;">
      </div>
      <div style="margin-bottom: 15px;">
        <label for="card" style="font-size: 14px; color: #555; display: block;">Card:</label>
        <input type="text" id="card" placeholder="Enter card number" style="width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; background-color: #fafafa;">
      </div>
      <div style="margin-bottom: 15px;">
        <label for="address" style="font-size: 14px; color: #555; display: block;">Address:</label>
        <input type="text" id="address" placeholder="Enter client address" style="width: 100%; padding: 10px; margin: 8px 0 20px; border: 1px solid #ddd; border-radius: 4px; background-color: #fafafa;">
      </div>
      <button id="save" style="background-color: #28a745; color: white; border: none; padding: 12px 20px; font-size: 16px; border-radius: 4px; width: 100%; cursor: pointer; transition: background-color 0.3s ease;">Save</button>
    </form>
    <a href="#clients" style="display: inline-block; margin-top: 20px; text-align: center; color: #007bff; font-size: 14px; text-decoration: none;">Back</a>
  </div>
`),

    events: {
      "click #save": "saveClient",
    },

    initialize: function () {
      this.render();
    },

    render: function () {
      this.$el.html(this.template());
    },

    saveClient: function (e) {
      e.preventDefault();
      Clients.create({
        name: this.$("#name").val(),
        card: this.$("#card").val(),
        address: this.$("#address").val(),
      });

      location.hash = "#clients"; // Redirect back to clients list
    },
  });

  var ClientListView = Backbone.View.extend({
    el: "#app",
    initialize: function () {
      Clients.fetch();
      this.render();
    },

    render: function () {
      var html = `
  <div style="text-align: center; padding: 30px 20px; background-color: #f4f4f9;">
    <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Clients</h2>
    <button id="add-client" style="background-color: #28a745; color: white; border: none; padding: 12px 20px; font-size: 16px; border-radius: 4px; cursor: pointer; transition: background-color 0.3s ease;">
      Add Client
    </button>
    <ul id="client-list" style="list-style-type: none; padding: 0; margin-top: 30px; max-width: 600px; margin: 0 auto;">
      <!-- List items will be dynamically added here -->
    </ul>
  </div>
`;

      this.$el.html(html);
      var ul = this.$("#client-list");
      Clients.each(function (client) {
        var view = new ClientItemView({ model: client });
        ul.append(view.render().el);
      });
    },

    events: {
      "click #add-client": function () {
        location.hash = "#addClient"; // Redirect to add client page
      },
    },
  });

  //StoreDashboardd
  var StoreView = Backbone.View.extend({
    el: "#app",
    initialize: function () {
      Products.fetch();
      this.render();
    },

    render: function () {
      var html = `
    <div style="max-width: 900px; margin: 40px auto; padding: 30px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <h2 style="text-align: center; color: #333; font-size: 28px; margin-bottom: 30px;">Storefront</h2>
      <ul id="shop-products" style="list-style-type: none; padding: 0; margin: 0;">
        <!-- Product items will be appended here -->
      </ul>
    </div>
  `;

      this.$el.html(html);
      var ul = this.$("#shop-products");

      Products.each(function (product) {
        ul.append(`
      <li style="display: flex; align-items: center; justify-content: space-between; background-color: #f9f9f9; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; align-items: center;">
          <img src="${product.get(
            "image"
          )}" width="80" style="border-radius: 4px; margin-right: 15px;">
          <div>
            <strong style="font-size: 18px; color: #007bff;">${product.get(
              "name"
            )}</strong><br>
            <span style="font-size: 16px; color: #555;">$${product.get(
              "price"
            )}</span>
          </div>
        </div>
        <button class="buy" data-id="${
          product.id
        }" style="background-color: #28a745; color: white; border: none; padding: 10px 20px; font-size: 16px; border-radius: 4px; cursor: pointer; transition: background-color 0.3s ease;">
          Buy
        </button>
      </li>
    `);
      });
    },
  });

  //Router
  var AppRouter = Backbone.Router.extend({
    routes: {
      products: "products",
      clients: "clients",
      shop: "shop",
      addProduct: "addProduct",
      "editProduct/:id": "editProduct",
      addClient: "addClient",
      "*default": "products",
    },

    products: function () {
      new ProductListView();
    },

    clients: function () {
      new ClientListView();
    },

    shop: function () {
      new StoreView();
    },

    addProduct: function () {
      new ProductFormView();
    },
    editProduct: function (id) {
      var product = Products.get(id);
      new ProductFormView({ model: product });
    },

    addClient: function () {
      new ClientFormView();
    },
  });

  // Start the router
  var router = new AppRouter();
  Backbone.history.start();
});
