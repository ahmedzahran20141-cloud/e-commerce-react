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
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="50" fill="#6c757d">
          No Image
        </text>
      </svg>
    `);
  
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/${productId}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Product added to cart!");
  };

  if (loading) return <Spinner text="Loading Product Details..." />;

  if (!product) return <div className="text-center mt-5"><h2>Product Not Found</h2></div>;

  return (
    <div className="card p-4 shadow-sm">
      <ToastContainer />
      <div className="row">
        <div className="col-md-5 text-center">
          <img src={product.image} alt={product.title} className="img-fluid" style={{ maxHeight: "400px" }} onError={(e)=>{ e.target.onerror=null; e.target.src=backupImage }} />
        </div>
        <div className="col-md-7">
          <h2>{product.title}</h2>
          <span className="badge bg-primary">{product.category}</span>
          <p className="lead mt-3">{product.description}</p>
          <h3 className="text-success">${product.price}</h3>
          <button className="btn btn-success btn-lg mt-3" onClick={addToCart}>🛒 Add To Cart</button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;