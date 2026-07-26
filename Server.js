require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 9000;
const SECRET_KEY = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce_db";

if (!SECRET_KEY) {
  console.error("❌ JWT_SECRET is missing in .env");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB successfully!"))
  .catch((error) => {
    console.error("❌ MongoDB Error:", error);
    process.exit(1);
  });

// ===================== Schemas =====================

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "customer"], default: "customer" }
});

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0.01 },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userEmail: { type: String, required: true },
  items: [{ id: Number, title: String, price: Number, quantity: Number, image: String }],
  total: { type: Number, required: true },
  method: { type: String, required: true },
  status: { type: String, default: "Pending" },
  date: { type: Date, default: Date.now }
});

// ===================== Models =====================

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Counter = mongoose.model("Counter", counterSchema);
const Order = mongoose.model("Order", orderSchema);

// ===================== Auto Increment =====================

async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// ===================== JWT Middleware =====================

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Access token missing" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

// ===================== Routes =====================

app.get("/", (req, res) => {
  res.json({ success: true, message: "Ahmed Zahran API - MongoDB Ecommerce 🍃" });
});

// ===================== Login =====================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid Email or Password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid Email or Password" });

    const payload = { id: user._id, email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });

    res.json({ token, user: payload });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ===================== Register =====================

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email: email.toLowerCase(), password: hash, role: "customer" });
    await user.save();

    res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===================== Upload Image =====================

// Upload folder
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}


// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});


const upload = multer({
  storage
});


app.use("/uploads", express.static("uploads"));


// Now upload route is allowed here
app.post("/upload", verifyJWT, upload.single("image"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      message: "No image uploaded"
    });
  }

  res.json({
    imageUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`
  });

});

// ===================== Products =====================

// Get ALL products (Dashboard)
app.get("/products/all", async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Get paginated products (Products page)
app.get("/products", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();

    const products = await Product.find({})
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
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Get one product by ID (THIS MUST BE LAST)
app.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findOne({ id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product
app.post("/products", verifyJWT, async (req, res) => {
  try {
    const { title, price, description, image, category } = req.body;

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
      message: "Product created",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product
app.put("/products/:id", verifyJWT, async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Updated successfully",
      product: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product
app.delete("/products/:id", verifyJWT, async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      id: Number(req.params.id),
    });

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===================== Image Upload =====================

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use("/uploads", express.static("uploads"));

// ===================== Orders =====================

app.post("/orders", verifyJWT, async (req, res) => {
  try {
    const { items, total, method } = req.body;
    if (!items || !items.length)
      return res.status(400).json({ message: "Cart is empty" });

    const order = new Order({
      userId: req.user.id,
      userEmail: req.user.email,
      items,
      total,
      method
    });

    await order.save();
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/orders", verifyJWT, async (req, res) => {
  try {
    const orders =
      req.user.role === "admin"
        ? await Order.find({}).sort({ date: -1 })
        : await Order.find({ userId: req.user.id }).sort({ date: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/orders/:id", verifyJWT, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, async () => {
  console.log("==================================");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("==================================");
});
