import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "./AuthContext";
import { authFetch, ORDERS_URL } from "../api";

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

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };


  const increaseQty = (id) => {

    const updated = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    saveCart(updated);
  };


  const decreaseQty = (id) => {

    const updated = cart
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter(
        (item) => item.quantity > 0
      );


    saveCart(updated);
  };


  const removeItem = (id) => {

    const updated = cart.filter(
      (item) => item.id !== id
    );

    saveCart(updated);
  };


  const handleCheckoutClick = () => {

    if (!user) {

      Swal.fire({
        title: "Please Login",
        text: "You must login before checkout.",
        icon: "warning",
      })
      .then(() => {
        navigate("/login");
      });

      return;
    }


    setShowCheckout(true);

  };



  const processOrder = async (method) => {

    const total = cart.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    );


    try {

      const response = await authFetch(
        ORDERS_URL,
        {
          method: "POST",
          body: JSON.stringify({
            items: cart,
            total,
            method,
          }),
        }
      );


      if (!response.ok) {

        const error =
          await response.json();

        throw new Error(
          error.message ||
          "Failed to create order"
        );

      }



      localStorage.removeItem("cart");

      setCart([]);

      window.dispatchEvent(
        new Event("cartUpdated")
      );


      setShowCheckout(false);



      Swal.fire(
        "Success!",
        "Order saved successfully.",
        "success"
      )
      .then(() => {
        navigate("/orders");
      });



    } catch(error){

      Swal.fire(
        "Error",
        error.message,
        "error"
      );

    }

  };



  const totalPrice = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );



  return (

    <div className="container py-4">

      <h2>
        🛒 Shopping Cart
      </h2>



      {cart.length === 0 ? (

        <div className="text-center mt-4">

          <h4>
            Your cart is empty
          </h4>


          <Link
            to="/"
            className="btn btn-primary mt-3"
          >
            Continue Shopping
          </Link>

        </div>


      ) : (

        <>

          <div className="row g-4 mt-2">


            {cart.map((item)=>(

              <div
                className="col-md-4"
                key={item.id}
              >

                <div className="card shadow-sm p-3">


                  <img
                    src={item.image}
                    alt={item.title}
                    height="150"
                    style={{
                      objectFit:"contain"
                    }}

                    onError={(e)=>{

                      e.target.onerror=null;

                      e.target.src=backupImage;

                    }}

                  />


                  <h5 className="mt-2">
                    {item.title}
                  </h5>


                  <p>
                    ${item.price}
                  </p>


                  <div className="d-flex justify-content-between align-items-center">

                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        increaseQty(item.id)
                      }
                    >
                      +
                    </button>


                    <span>
                      {item.quantity}
                    </span>


                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        decreaseQty(item.id)
                      }
                    >
                      -
                    </button>


                  </div>


                  <button
                    className="btn btn-danger mt-2"
                    onClick={() =>
                      removeItem(item.id)
                    }
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

        <div
          className="modal-backdrop d-flex justify-content-center align-items-center"
        >

          <div
            className="bg-white p-4 rounded shadow"
            style={{
              width:"350px"
            }}
          >

            <h4>
              Payment Method
            </h4>


            <button
              className="btn btn-outline-primary w-100 my-2"
              onClick={() =>
                processOrder(
                  "Cash On Delivery"
                )
              }
            >
              Cash On Delivery
            </button>


            <button
              className="btn btn-outline-success w-100 my-2"
              onClick={() =>
                processOrder(
                  "Stripe Gateway"
                )
              }
            >
              Pay with Stripe
            </button>


            <button
              className="btn btn-danger w-100"
              onClick={() =>
                setShowCheckout(false)
              }
            >
              Cancel
            </button>


          </div>

        </div>

      )}


    </div>

  );

}


export default Cart;