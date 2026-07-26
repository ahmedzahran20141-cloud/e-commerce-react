require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce_db";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
});

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Counter = mongoose.model("Counter", counterSchema);

const productsData = [
  {
    title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    category: "men's clothing",
    price: 109.95,
    description:
      "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
    image:
      "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png",
  },
  {
    title: "Mens Casual Premium Slim Fit T-Shirts",
    price: 22.3,
    description:
      "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric.",
    category: "men's clothing",
    image:
      "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png",
  },
  {
    title: "Mens Cotton Jacket",
    price: 55.99,
    description:
      "Great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions.",
    category: "men's clothing",
    image:
      "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png",
  },
  {
    title: "Mens Casual Slim Fit",
    price: 15.99,
    description:
      "The color could be slightly different between on the screen and in practice.",
    category: "men's clothing",
    image:
      "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_t.png",
  },
  {
    title:
      "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
    price: 695,
    description:
      "From our Legends Collection, the Naga was inspired by the mythical water dragon.",
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_t.png",
    category: "jewelery",
  },
  {
    title: "Solid Gold Petite Micropave",
    price: 168,
    description:
      "Satisfaction Guaranteed. Return or exchange any order within 30 days.",
    category: "jewelery",
    image:
      "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_t.png",
  },
  {
    title: "White Gold Plated Princess",
    price: 9.99,
    description:
      "Classic Created Wedding Engagement Solitaire Diamond Promise Ring for Her.",
    category: "jewelery",
    image:
      "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_t.png",
  },
  {
    title: "Pierced Owl Rose Gold Plated Stainless Steel Double",
    price: 10.99,
    description:
      "Rose Gold Plated Double Flared Tunnel Plug Earrings.",
    category: "jewelery",
    image:
      "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_t.png",
  },
    {
    title: "WD 2TB Elements Portable External Hard Drive - USB 3.0",
    price: 64,
    description:
      "USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance.",
    category: "electronics",
    image:
      "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_t.png",
  },
  {
    title: "SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s",
    price: 109,
    description:
      "Easy upgrade for faster boot up, shutdown, application load and response.",
    category: "electronics",
    image:
      "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_t.png",
  },
  {
    title: "Silicon Power 256GB SSD 3D NAND A55",
    price: 109,
    description:
      "3D NAND flash are applied to deliver high transfer speeds.",
    category: "electronics",
    image:
      "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_t.png",
  },
  {
    title: "WD 4TB Gaming Drive Works with Playstation 4",
    price: 114,
    description:
      "Expand your PS4 gaming experience, Play anywhere Fast and easy setup.",
    category: "electronics",
    image:
      "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_t.png",
  },
  {
    title: "Acer SB220Q bi 21.5 inches Full HD IPS Ultra-Thin",
    price: 599,
    description:
      "21.5 inches Full HD widescreen IPS display with Radeon free Sync technology.",
    category: "electronics",
    image:
      "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_t.png",
  },
  {
    title: "Samsung 49-Inch CHG90 144Hz Curved Gaming Monitor",
    price: 999.99,
    description:
      "49 INCH SUPER ULTRAWIDE 32:9 CURVED GAMING MONITOR with dual 27 inch screens.",
    category: "electronics",
    image:
      "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_t.png",
  },
  {
    title: "BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats",
    price: 56.99,
    description:
      "US standard size, detachable liner fabric, warm fleece.",
    category: "women's clothing",
    image:
      "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_t.png",
  },
  {
    title: "Lock and Love Women's Removable Hooded Faux Leather Moto Jacket",
    price: 29.95,
    description:
      "Faux leather material for style and comfort.",
    category: "women's clothing",
    image:
      "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_t.png",
  },
  {
    title: "Rain Jacket Women Windbreaker Striped Climbing Raincoats",
    price: 39.99,
    description:
      "Lightweight perfect for trip or casual wear.",
    category: "women's clothing",
    image:
      "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2t.png",
  },
  {
    title: "MBJ Women's Solid Short Sleeve Boat Neck",
    price: 9.85,
    description:
      "Lightweight fabric with great stretch for comfort.",
    category: "women's clothing",
    image:
      "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_t.png",
  },
  {
    title: "Opna Women's Short Sleeve Moisture",
    price: 7.95,
    description:
      "100% Polyester, Machine wash, lightweight and breathable.",
    category: "women's clothing",
    image:
      "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_t.png",
  },
  {
    title: "DANVOUY Womens T Shirt Casual Cotton Short",
    price: 12.99,
    description:
      "95% Cotton, 5% Spandex, casual short sleeve V-neck.",
    image:
      "https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_t.png",
    category: "women's clothing",
  },
];

async function seedDatabase() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!");

    await User.deleteMany({});
    await Product.deleteMany({});
    await Counter.deleteMany({});
    console.log("🧹 Cleared old data.");

    const defaultPasswordHash = await bcrypt.hash("CCIEsecurity2015", 10);

    const usersData = [
      {
        email: "ahmedzahran20141@gmail.com",
        name: "Ahmed Zahran",
        password: defaultPasswordHash,
        role: "admin",
      },
      {
        email: "abdelhamidzahran1988@gmail.com",
        name: "Abdelhamid Zahran",
        password: defaultPasswordHash,
        role: "customer",
      },
    ];

    const productsWithIds = productsData.map((product, index) => ({
      id: index + 1,
      ...product,
    }));

    await User.insertMany(usersData);
    await Product.insertMany(productsWithIds);
    await Counter.create({ _id: "productId", seq: productsData.length });

    console.log("🎉 Successfully seeded database!");
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();