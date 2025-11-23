$(function () {
  // Product Model
  var Product = Backbone.Model.extend({
    defaults: {
      name: "",
      description: "",
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
  <div class="product-item">
    <div style="display: flex; align-items: center;">
      <img src="<%- image %>">
      <div style="flex-grow: 1;">
        <strong><%- name %></strong><br>
        <span><%- description %></span><br>
        <span>Php <%- price %></span>
      </div>
    </div>
    <div>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
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
    tagName: "div",
    className: "page",

    template: _.template(`
<div class="form-container">
  <h2><%- editing ? "Edit" : "Add" %> Product</h2>
  <form>
    <div class="form-group">
      <label for="name">Name:</label>
      <input type="text" id="name" value="<%- name %>" placeholder="Enter product name" required>
    </div>
    <div class="form-group">
      <label for="description">Description:</label>
      <input type="text" id="description" value="<%- description %>" placeholder="Enter product description">
    </div>
    <div class="form-group">
      <label for="price">Price:</label>
      <input type="number" id="price" value="<%- price %>" placeholder="Enter product price" required>
    </div>
    <div class="form-group">
      <label for="imageFile">Upload Image:</label>
      <input type="file" id="imageFile" accept="image/*" <%- editing ? "" : "required" %>>
    </div>
    <div class="form-group">
      <img id="imagePreview" src="<%- image %>" style="max-width:200px; margin-top:10px; display:<%- image ? 'block' : 'none' %>;">
    </div>
    <button id="save">Save</button>
  </form>
  <a href="#products" class="back-link">Back</a>
</div>
  `),

    events: {
      "change #imageFile": "previewImage",
      "click #save": "saveProduct",
    },

    initialize: function () {
      this.editing = !!this.model;
      this.uploadedImage = this.model ? this.model.get("image") : null;
      this.render();
    },

    render: function () {
      this.$el.html(
        this.template(
          this.model
            ? {
                editing: true,
                name: this.model.get("name"),
                description: this.model.get("description"),
                price: this.model.get("price"),
                image: this.model.get("image"),
              }
            : {
                editing: false,
                name: "",
                description: "",
                price: "",
                image: "",
              }
        )
      );

      if (!this.editing) {
        this.$("#imageFile").val("");
        this.$("#imagePreview").hide().attr("src", "");
        this.uploadedImage = null;
      }
    },

    previewImage: function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        this.uploadedImage = event.target.result;
        this.$("#imagePreview").attr("src", this.uploadedImage).show();
      };
      reader.readAsDataURL(file);
    },

    saveProduct: function (e) {
      e.preventDefault();

      const name = this.$("#name").val().trim();
      const price = parseFloat(this.$("#price").val());

      if (!name || !price || (!this.uploadedImage && !this.editing)) {
        alert("Product name, price, and image are required!");
        return;
      }

      const data = {
        name: name,
        description: this.$("#description").val().trim(),
        price: price,
        image:
          this.uploadedImage || (this.model ? this.model.get("image") : ""),
      };

      if (this.editing) {
        this.model.set(data).save();
      } else {
        Products.create(data);
      }

      location.hash = "#products";
    },
  });

  // Product List View
  var ProductListView = Backbone.View.extend({
    tagName: "div",
    className: "page",
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
      ul.empty();

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
  <div class="client-item">
    <div>
      <strong><%- name %></strong><br>
      <span><%- card %></span><br>
      <span><%- address %></span>
    </div>
    <button class="delete">Delete</button>
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
    tagName: "div",
    className: "page",

    template: _.template(`
  <div class="form-container">
    <h2>Add Client</h2>
    <form>
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" placeholder="Enter client name">
      </div>
      <div class="form-group">
        <label for="card">Card:</label>
        <input type="text" id="card" placeholder="Enter card number">
      </div>
      <div class="form-group">
        <label for="address">Address:</label>
        <input type="text" id="address" placeholder="Enter client address">
      </div>
      <button id="save">Save</button>
    </form>
    <a href="#clients" class="back-link">Back</a>
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
      if (
        !this.$("#name").val().trim() ||
        !this.$("#card").val().trim() ||
        !this.$("#address").val().trim()
      ) {
        alert("All fields are required!");
        return;
      }
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
    tagName: "div",
    className: "page",
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
      ul.empty();

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
    tagName: "div",
    className: "page",
    initialize: function () {
      Products.fetch();
      this.render();
    },

    render: function () {
      var html = `
    <div style="max-width: 900px; margin: 40px auto; padding: 30px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <ul id="shop-products" style="list-style-type: none; padding: 0; margin: 0;">
        <!-- Product items will be appended here -->
      </ul>
    </div>
  `;

      this.$el.html(html);
      var ul = this.$("#shop-products");
      ul.empty();

      Products.each(function (product) {
        ul.append(`
    <li class="shop-product-item">
      <img src="${product.get("image")}">
      <strong>${product.get("name")}</strong>
      <span>${product.get("description")}</span>
      <h3>₱${product.get("price")}</h3>
      <button class="buy" data-id="${product.id}">Buy</button>
    </li>
  `);
      });
    },
  });

  //Router
  var currentView = null;

  function showView(view) {
    if (currentView) currentView.remove();
    currentView = view;

    $("#app").html(view.el);
    view.render();

    return view;
  }

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
      showView(new ProductListView());
    },

    clients: function () {
      showView(new ClientListView());
    },

    shop: function () {
      showView(new StoreView());
    },

    addProduct: function () {
      showView(new ProductFormView());
    },

    editProduct: function (id) {
      var p = Products.get(id);
      showView(new ProductFormView({ model: p }));
    },

    addClient: function () {
      showView(new ClientFormView());
    },
  });

  // Start the router
  var router = new AppRouter();
  Backbone.history.start();
});
