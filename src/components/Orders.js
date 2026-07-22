import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

function Orders() {

  const [orders, setOrders] = useState([]);


  useEffect(() => {

    loadOrders();

  }, []);



  const loadOrders = () => {

    const data =
      JSON.parse(localStorage.getItem("orders")) || [];

    setOrders(data);

  };



  const deleteOrder = (id) => {


    Swal.fire({

      title: "Delete Order?",

      text: "This order will be removed permanently.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Delete",

      confirmButtonColor: "#d33"

    })
    .then(result => {


      if(result.isConfirmed){


        const updated =
          orders.filter(
            order => order.id !== id
          );


        setOrders(updated);


        localStorage.setItem(
          "orders",
          JSON.stringify(updated)
        );


        Swal.fire(
          "Deleted!",
          "Order removed.",
          "success"
        );


      }


    });


  };



  const clearOrders = () => {


    Swal.fire({

      title: "Clear all orders?",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Yes"

    })
    .then(result => {


      if(result.isConfirmed){

        localStorage.removeItem("orders");

        setOrders([]);

      }


    });


  };



  return (

    <div className="container py-4">


      <div className="d-flex justify-content-between align-items-center mb-4">


        <h2>
          📦 Order History
        </h2>


        {orders.length > 0 && (

          <button

            className="btn btn-danger"

            onClick={clearOrders}

          >

            Clear Orders

          </button>

        )}


      </div>




      {orders.length === 0 ? (


        <div className="text-center">


          <h4>
            No completed orders yet.
          </h4>


          <Link

            to="/"

            className="btn btn-primary mt-3"

          >

            Start Shopping

          </Link>


        </div>


      ) : (


        orders.map(order => (


          <div

            className="card shadow-sm mb-4"

            key={order.id}

          >


            <div className="card-body">


              <div className="d-flex justify-content-between">


                <div>

                  <h5>

                    Order #{order.id}

                  </h5>


                  <p className="text-muted mb-1">

                    Date: {order.date}

                  </p>


                  <p>

                    Payment:
                    <span className="badge bg-primary ms-2">

                      {order.method}

                    </span>

                  </p>


                </div>



                <button

                  className="btn btn-outline-danger btn-sm"

                  onClick={()=>
                    deleteOrder(order.id)
                  }

                >

                  Delete

                </button>


              </div>



              <hr />



              <h6>
                Products:
              </h6>



              {order.items.map(item => (


                <div

                  key={item.id}

                  className="d-flex justify-content-between align-items-center border-bottom py-2"

                >


                  <div className="d-flex align-items-center">


                    <img

                      src={item.image}

                      alt={item.title}

                      width="60"

                      height="60"

                      style={{
                        objectFit:"contain"
                      }}


                      onError={(e)=>{

                        e.target.src =
                        "https://placehold.co/60x60?text=No";

                      }}

                    />


                    <span className="ms-3">

                      {item.title}

                    </span>


                  </div>



                  <div>


                    <span>

                      x{item.quantity}

                    </span>


                    <strong className="ms-3 text-success">

                      ${(item.price * item.quantity).toFixed(2)}

                    </strong>


                  </div>


                </div>


              ))}



              <h5 className="text-end mt-3">


                Total:

                <span className="text-success ms-2">

                  ${order.total.toFixed(2)}

                </span>


              </h5>


            </div>


          </div>


        ))

      )}


    </div>

  );

}


export default Orders;