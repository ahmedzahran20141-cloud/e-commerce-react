require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

const PORT = Number(process.env.PORT) || 9000;
const SECRET_KEY = process.env.JWT_SECRET;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce_db";

if (!SECRET_KEY) {
  console.error("❌ JWT_SECRET is missing in .env");
  process.exit(1);
}

// ======================================================
// Middleware
// ======================================================

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

// Upload folder
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use("/uploads", express.static("uploads"));

// ======================================================
// MongoDB
// ======================================================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
  })
  .catch((error) => {
    console.error("❌ MongoDB Error:", error);
    process.exit(1);
  });

// ======================================================
// Schemas
// ======================================================

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  // customer | driver | admin
  role: {
    type: String,
    enum: ["admin", "customer", "driver"],
    default: "customer",
  },
});

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0.01,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },

  seq: {
    type: Number,
    default: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userEmail: String,

    items: Array,

    total: Number,

    method: String,

    paymentId: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "Pending",
    },

    carrier: {
      type: String,
      default: "",
    },

    trackingNumber: {
      type: String,
      default: "",
    },

    estimatedDelivery: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// Models
// ======================================================

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Counter = mongoose.model("Counter", counterSchema);
const Order = mongoose.model("Order", orderSchema);

// ======================================================
// Helpers
// ======================================================

async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findByIdAndUpdate(
    sequenceName,
    {
      $inc: { seq: 1 },
    },
    {
      new: true,
      upsert: true,
    }
  );

  return counter.seq;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },

  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
});

// ======================================================
// Authentication Middlewares
// ======================================================

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
}

function verifyAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied: Admin privileges required",
  });
}

function verifyDriver(req, res, next) {

  if (req.user && req.user.role === "driver") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied: Driver privileges required"
    });
  }

}

// ======================================================
// Basic Route
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ahmed Zahran API - MongoDB Ecommerce 🍃",
  });
});

// ======================================================
// Login
// ======================================================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: "2h",
    });

    res.json({
      success: true,
      token,
      user: payload,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ======================================================
// Register Customer
// ======================================================

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const exists = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (exists) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      password: hash,
      role: "customer",
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================================
// Upload
// ======================================================

app.post(
  "/upload",
  verifyJWT,
  verifyAdmin,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    res.json({
      success: true,
      imageUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`,
    });
  }
);

// ======================================================
// Products
// ======================================================

// Get all products
app.get("/products/all", async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
    });
  }
});

// Get products with pagination
app.get("/products", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();

    const products = await Product.find()
      .sort({ id: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
    });
  }
});

// Get one product
app.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await Product.findOne({ id });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Create product (Admin only)
app.post("/products", verifyJWT, verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      image,
      category,
    } = req.body;

    const id = await getNextSequenceValue("productId");

    const product = new Product({
      id,
      title,
      price: Number(price),
      description,
      image,
      category,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update product (Admin only)
app.put("/products/:id", verifyJWT, verifyAdmin, async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      {
        id: Number(req.params.id),
      },
      req.body,
      {
        new: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Delete product (Admin only)
app.delete("/products/:id", verifyJWT, verifyAdmin, async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      id: Number(req.params.id),
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================================
// Stripe Payment
// ======================================================

app.post("/create-payment-intent", verifyJWT, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Invalid amount",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================================
// Orders
// ======================================================

// Create Order
app.post("/orders", verifyJWT, async (req, res) => {

  try {

    const { items, total, method } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const order = new Order({
      userId: req.user.id,
      userEmail: req.user.email,
      items,
      total,
      method,
    });

    await order.save();

    res.status(201).json({
      success: true,
      order,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

});

// ======================================================
// Get Orders
// ======================================================

app.get("/orders", verifyJWT, async (req, res) => {

  try {

    let orders;

    if (req.user.role === "admin" || req.user.role === "driver") {

      orders = await Order.find().sort({
        createdAt: -1,
      });

    } else {

      orders = await Order.find({
        userId: req.user.id,
      }).sort({
        createdAt: -1,
      });

    }

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

});

// ======================================================
// Get One Order
// ======================================================

app.get("/orders/:id", verifyJWT, async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      req.user.role !== "driver" &&
      order.userId.toString() !== req.user.id
    ) {

      return res.status(403).json({
        message: "Access denied",
      });

    }

    res.json(order);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

});

// ======================================================
// Driver Update Order Status
// Driver can ONLY update order status
// ======================================================

// ===================== Driver Update Order Status =====================

app.put("/orders/:id/driver", verifyJWT, verifyDriver, async (req, res) => {

  try {

    const { status } = req.body;


    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered"
    ];


    if (!allowedStatuses.includes(status)) {

      return res.status(400).json({
        message: "Invalid order status"
      });

    }


    const order = await Order.findById(req.params.id);


    if (!order) {

      return res.status(404).json({
        message: "Order not found"
      });

    }


    order.status = status;


    await order.save();


    res.json({

      success: true,

      message: "Order status updated successfully",

      order

    });


  } catch(error) {

    res.status(500).json({

      message: error.message

    });

  }

});

// ======================================================
// Admin Update Order
// ======================================================

app.put(
  "/orders/:id/admin",
  verifyJWT,
  verifyAdmin,
  async (req, res) => {
    try {
      const {
        status,
        carrier,
        trackingNumber,
        estimatedDelivery,
      } = req.body;

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
          status,
          carrier,
          trackingNumber,
          estimatedDelivery,
        },
        {
          new: true,
        }
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Order updated successfully.",
        order,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

// ======================================================
// Delete Order
// Admin ONLY
// ======================================================

app.delete(
  "/orders/:id",
  verifyJWT,
  verifyAdmin,
  async (req, res) => {
    try {
      const deleted = await Order.findByIdAndDelete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Order deleted successfully.",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

// ======================================================
// Server
// ======================================================

app.listen(PORT, () => {
  console.log("==================================");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("==================================");
});