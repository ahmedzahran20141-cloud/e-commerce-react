import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { authFetch, ORDERS_URL } from "../api";
import InvoicePDF from "./InvoicePDF";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 5000);


    return () => clearInterval(interval);

  }, []);

  const loadOrders = async () => {
    try {
      const response = await authFetch(ORDERS_URL);

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await response.json();

      setOrders(Array.isArray(data) ? data : []);

    } catch (error) {
      console.log(error);
      setOrders([]);

    } finally {
      setLoading(false);
    }
  };


  const deleteOrder = async (id) => {

    const result = await Swal.fire({
      title: "Delete Order?",
      text: "This order will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });


    if (!result.isConfirmed) return;


    try {

      const response = await authFetch(
        `${ORDERS_URL}/${id}`,
        {
          method: "DELETE",
        }
      );


      if (!response.ok) {
        throw new Error("Delete failed");
      }


      setOrders(
        orders.filter(
          (order) => order._id !== id
        )
      );


      Swal.fire(
        "Deleted!",
        "Order removed successfully.",
        "success"
      );


    } catch (error) {

      Swal.fire(
        "Error",
        error.message,
        "error"
      );

    }

  };



  const statusColor = (status) => {

    switch (status) {

      case "Delivered":
        return "success";

      case "Shipped":
        return "primary";

      case "Processing":
        return "info";

      case "Cancelled":
        return "danger";

      default:
        return "warning";
    }

  };



  if (loading) {

    return (

      <div className="container py-5 text-center">

        <h4>
          Loading Orders...
        </h4>

      </div>

    );

  }



  return (

    <div className="container py-4">


      <h2 className="mb-4">
        📦 Order History
      </h2>



      {
        orders.length === 0 ? (

          <div className="text-center">

            <h4>
              No orders found
            </h4>


            <Link
              to="/"
              className="btn btn-primary mt-3"
            >
              Start Shopping
            </Link>

          </div>


        ) : (


          orders.map((order) => (

            <div
              className="card shadow-sm mb-4"
              key={order._id}
            >


              <div className="card-body">


                <div className="d-flex justify-content-between">


                  <div>

                    <h4>

                      📦 Order #

                      {
                        order.orderNumber ||
                        order._id.slice(-6)
                      }

                    </h4>


                    <p className="mb-1">

                      👤 Customer:

                      {" "}

                      {order.userEmail}

                    </p>



                    <p className="mb-1">

                      📅 Date:

                      {" "}

                      {
                        new Date(
                          order.date
                        ).toLocaleString()
                      }

                    </p>


                  </div>



                  <button

                    className="btn btn-outline-danger btn-sm"

                    onClick={() =>
                      deleteOrder(order._id)
                    }

                  >

                    Delete

                  </button>


                </div>



                <hr />



                <div className="row text-center">


                  <div className="col-md-3">

                    <h6>
                      Payment
                    </h6>


                    <span className="badge bg-success">

                      {
                        order.method === "Stripe Gateway"
                          ? "💳 Stripe"
                          : "💵 Cash On Delivery"
                      }

                    </span>


                  </div>




                  <div className="col-md-3">

                    <h6>
                      Status
                    </h6>


                    <span
                      className={
                        `badge bg-${statusColor(
                          order.status
                        )}`
                      }
                    >

                      {
                        order.status ||
                        "Pending"
                      }

                    </span>


                  </div>




                  <div className="col-md-3">

                    <h6>
                      Products
                    </h6>


                    <strong>

                      {
                        order.items?.length || 0
                      }

                    </strong>


                  </div>




                  <div className="col-md-3">

                    <h6>
                      Total
                    </h6>


                    <strong className="text-success">

                      $
                      {
                        Number(order.total)
                        .toFixed(2)
                      }

                    </strong>


                  </div>


                </div>



                <hr />



                <div className="row">


                  <div className="col-md-4">

                    🚚 Carrier:

                    <strong>

                      {" "}

                      {
                        order.carrier ||
                        "Not assigned"
                      }

                    </strong>

                  </div>



                  <div className="col-md-4">

                    🔎 Tracking:

                    <strong>

                      {" "}

                      {
                        order.trackingNumber ||
                        "Not available"
                      }

                    </strong>

                  </div>



                  <div className="col-md-4">

                    📅 Delivery:

                    <strong>

                      {" "}

                      {
                        order.estimatedDelivery ||
                        "Not available"
                      }

                    </strong>

                  </div>


                </div>



                <div className="mt-4 d-flex gap-2">


                  <Link
                    to={`/orders/${order._id}`}
                    className="btn btn-primary"
                  >

                    View Details

                  </Link>



                  <InvoicePDF order={order}/>


                </div>



              </div>


            </div>


          ))

        )

      }


    </div>

  );

}


export default Orders;