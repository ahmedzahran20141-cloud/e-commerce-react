import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "./AuthContext";
import { authFetch, ORDERS_URL, PAYMENT_URL } from "../api";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Replace with your real Stripe Publishable Key
const stripePromise = loadStripe("pk_test_51Txmh2Li6wd7RANa4WjtOcOKEZ7JN8FZTYdt99ozzBM0D8tdua1SiO3qN45mVSBWD5cJ6NKIbeLLyh5H6ar2wUrC00B2f9Blmz");

function StripeCheckoutForm({ totalPrice, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStripePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await authFetch(PAYMENT_URL, {
        method: "POST",
        body: JSON.stringify({ amount: totalPrice }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate payment");
      }

      const cardElement = elements.getElement(CardElement);
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: { card: cardElement },
        }
      );

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      } else if (paymentIntent.status === "succeeded") {
        setLoading(false);
        onSuccess(
          "Stripe Gateway",
          paymentIntent.id
        );
      }
    } catch (err) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleStripePay}>
      <h5 className="mb-3">Enter Credit Card Details</h5>
      <div className="p-3 border rounded mb-3 bg-light">
        <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
      </div>

      {errorMessage && (
        <div className="alert alert-danger p-2 small">{errorMessage}</div>
      )}

      <button
        type="submit"
        className="btn btn-success w-100 my-2"
        disabled={!stripe || loading}
      >
        {loading ? "Processing Payment..." : `Pay $${totalPrice.toFixed(2)}`}
      </button>

      <button
        type="button"
        className="btn btn-secondary w-100"
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </button>
    </form>
  );
}

function Cart() {
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

  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMode, setPaymentMode] = useState("select");

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const raw = localStorage.getItem("cart");
      const data = raw ? JSON.parse(raw) : [];
      setCart(Array.isArray(data) ? data : []);
    } catch {
      setCart([]);
    }
  };

  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQty = (id) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(updated);
  };

  const decreaseQty = (id) => {
    const updated = cart
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    saveCart(updated);
  };

  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const handleCheckoutClick = () => {
    if (!user) {
      Swal.fire({
        title: "Please Login",
        text: "You must login before checkout.",
        icon: "warning",
      }).then(() => {
        navigate("/login");
      });
      return;
    }
    setPaymentMode("select");
    setShowCheckout(true);
  };

  const processOrder = async (method, paymentId = "") => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      const response = await authFetch(ORDERS_URL, {
        method: "POST",
        body: JSON.stringify({
          items: cart,
          total,
          method,
          paymentId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create order");
      }

      localStorage.removeItem("cart");
      setCart([]);
      window.dispatchEvent(new Event("cartUpdated"));
      setShowCheckout(false);

      Swal.fire("Success!", "Order placed successfully.", "success").then(
        () => {
          navigate("/orders");
        }
      );
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="container py-4">
      <h2>🛒 Shopping Cart</h2>

      {cart.length === 0 ? (
        <div className="text-center mt-4">
          <h4>Your cart is empty</h4>
          <Link to="/" className="btn btn-primary mt-3">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="row g-4 mt-2">
            {cart.map((item) => (
              <div className="col-md-4" key={item.id}>
                <div className="card shadow-sm p-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    height="150"
                    style={{ objectFit: "contain" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = backupImage;
                    }}
                  />
                  <h5 className="mt-2">{item.title}</h5>
                  <p>${item.price}</p>

                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-primary"
                      onClick={() => increaseQty(item.id)}
                    >
                      +
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="btn btn-primary"
                      onClick={() => decreaseQty(item.id)}
                    >
                      -
                    </button>
                  </div>

                  <button
                    className="btn btn-danger mt-2"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card shadow mt-4 p-4">
            <h4>
              Total:
              <span className="text-success ms-2">
                ${totalPrice.toFixed(2)}
              </span>
            </h4>

            <button
              className="btn btn-success btn-lg mt-3"
              onClick={handleCheckoutClick}
            >
              Checkout
            </button>
          </div>
        </>
      )}

      {showCheckout && (
        <div className="modal-backdrop d-flex justify-content-center align-items-center">
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "380px" }}
          >
            {paymentMode === "select" ? (
              <>
                <h4>Payment Method</h4>
                <button
                  className="btn btn-outline-primary w-100 my-2"
                  onClick={() => processOrder("Cash On Delivery")}
                >
                  Cash On Delivery
                </button>

                <button
                  className="btn btn-outline-success w-100 my-2"
                  onClick={() => setPaymentMode("stripe")}
                >
                  Pay with Stripe
                </button>

                <button
                  className="btn btn-danger w-100"
                  onClick={() => setShowCheckout(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <Elements stripe={stripePromise}>
                <StripeCheckoutForm
                  totalPrice={totalPrice}
                  onSuccess={(method, paymentId) =>
                    processOrder(method, paymentId)
                  }
                  onCancel={() => setPaymentMode("select")}
                />
              </Elements>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;