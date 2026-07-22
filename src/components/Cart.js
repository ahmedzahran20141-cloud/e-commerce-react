import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

function Cart() {

  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);


  useEffect(() => {

    loadCart();

  }, []);


  const loadCart = () => {

    const data =
      JSON.parse(localStorage.getItem("cart")) || [];

    setCart(data);

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

    const updated = cart.map(item =>

      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1
          }
        : item

    );


    saveCart(updated);

  };


  const decreaseQty = (id) => {

    const updated = cart
      .map(item =>

        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1
            }
          : item

      )
      .filter(item => item.quantity > 0);


    saveCart(updated);

  };


  const removeItem = (id) => {


    const updated =
      cart.filter(item => item.id !== id);


    saveCart(updated);


  };


  const clearCart = () => {


    Swal.fire({

      title: "Clear Cart?",

      text: "All products will be removed.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Yes"

    })
    .then(result => {

      if(result.isConfirmed){

        localStorage.removeItem("cart");

        setCart([]);

        window.dispatchEvent(
          new Event("cartUpdated")
        );

      }

    });


  };


  const checkout = (method) => {


    const orders =
      JSON.parse(localStorage.getItem("orders")) || [];


    const total =
      cart.reduce(
        (sum,item)=>
          sum + item.price * item.quantity,
        0
      );


    orders.push({

      id: Date.now(),

      date: new Date().toLocaleString(),

      method,

      total,

      items: cart

    });



    localStorage.setItem(
      "orders",
      JSON.stringify(orders)
    );


    localStorage.removeItem("cart");


    setCart([]);


    window.dispatchEvent(
      new Event("cartUpdated")
    );


    setShowCheckout(false);



    Swal.fire(
      "Success!",
      "Order completed",
      "success"
    );


  };


  const totalPrice =
    cart.reduce(
      (sum,item)=>
        sum + item.price * item.quantity,
      0
    );



  return (

    <div className="container py-4">


      <div className="d-flex justify-content-between align-items-center mb-4">


        <h2>
          🛒 Shopping Cart
        </h2>


        {cart.length > 0 && (

          <button
            className="btn btn-danger"
            onClick={clearCart}
          >

            Clear Cart

          </button>

        )}


      </div>



      {cart.length === 0 ? (

        <div className="text-center">

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


        <div className="row g-4">


          {cart.map(item => (


            <div
              className="col-md-4"
              key={item.id}
            >


              <div className="card shadow-sm p-3">


                <img

                  src={item.image}

                  alt={item.title}

                  className="card-img-top"

                  style={{

                    height:"200px",

                    objectFit:"contain"

                  }}


                  onError={(e)=>{

                    e.target.src =
                    "https://placehold.co/300x200?text=No+Image";

                  }}

                />



                <h5 className="mt-3">

                  {item.title}

                </h5>



                <p>

                  Price:
                  <strong>
                    ${item.price}
                  </strong>

                </p>



                <div className="d-flex justify-content-between align-items-center">


                  <button

                    className="btn btn-primary"

                    onClick={()=>
                      increaseQty(item.id)
                    }

                  >

                    +

                  </button>



                  <span className="fw-bold">

                    {item.quantity}

                  </span>



                  <button

                    className="btn btn-primary"

                    onClick={()=>
                      decreaseQty(item.id)
                    }

                  >

                    -

                  </button>


                </div>



                <button

                  className="btn btn-outline-danger mt-3"

                  onClick={()=>
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
            <span className="text-success">
              ${totalPrice.toFixed(2)}
            </span>

          </h4>



          <button

            className="btn btn-success btn-lg mt-3"

            onClick={()=>
              setShowCheckout(true)
            }

          >

            Checkout

          </button>


        </div>


        </>

      )}



      {showCheckout && (


        <div className="modal-backdrop">


          <div className="bg-white p-4 rounded shadow mx-auto mt-5"
               style={{maxWidth:"400px"}}>


            <h4>
              Payment Method
            </h4>


            <button

              className="btn btn-outline-primary w-100 my-2"

              onClick={()=>
                checkout("Delivery")
              }

            >

              Cash On Delivery

            </button>



            <button

              className="btn btn-outline-primary w-100 my-2"

              onClick={()=>
                checkout("Card")
              }

            >

              Card Payment

            </button>



            <button

              className="btn btn-danger w-100"

              onClick={()=>
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