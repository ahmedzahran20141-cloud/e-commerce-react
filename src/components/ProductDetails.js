import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Spinner from "./Spinner";
import { API_URL } from "../api";

function ProductDetails() {
  const backupImage =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
              font-size="50" fill="#6c757d">
          No Image
        </text>
      </svg>
    `);

  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find((item) => item.id === Number(product.id));

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({
        ...product,
        id: Number(product.id),
        quantity: 1,
        addedAt: new Date().toLocaleString(),
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Product added to cart!");
  };

  if (loading) return <Spinner text="Loading Product Details..." />;

  if (!product) {
    return (
      <div className="text-center mt-5">
        <h2>Product Not Found</h2>
        <Link to="/" className="btn btn-dark mt-3">
          Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-4 shadow-sm">
      <ToastContainer />
      <div className="row">
        <div className="col-md-5 text-center">
          <img
            src={product.image}
            alt={product.title}
            className="img-fluid mb-3"
            style={{ maxHeight: "400px", objectFit: "contain" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = backupImage;
            }}
          />
        </div>

        <div className="col-md-7">
          <h2>{product.title}</h2>
          <span className="badge bg-primary">{product.category}</span>
          <p className="lead mt-3">{product.description}</p>
          <h3 className="text-success">${product.price}</h3>

          <div className="d-flex gap-2 mt-4">
            <button className="btn btn-success btn-lg" onClick={addToCart}>
              🛒 Add To Cart
            </button>
            <Link to="/cart" className="btn btn-warning btn-lg">
              View Cart
            </Link>
            <Link to="/" className="btn btn-dark btn-lg">
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;