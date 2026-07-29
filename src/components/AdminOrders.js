import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { authFetch, ORDERS_URL } from "../api";


function AdminOrders() {


  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    loadOrders();

  }, []);




  const loadOrders = async () => {


    try {


      const response = await authFetch(
        ORDERS_URL
      );


      const data = await response.json();


      if(!response.ok){

        throw new Error(
          data.message || "Failed to load orders"
        );

      }


      setOrders(
        Array.isArray(data)
        ? data
        : []
      );


    } catch(error){


      Swal.fire(
        "Error",
        error.message,
        "error"
      );


    } finally {


      setLoading(false);


    }


  };







  const updateOrder = async(order)=>{


    try{


      const response = await authFetch(

        `${ORDERS_URL}/${order._id}/admin`,

        {

          method:"PUT",

          body:JSON.stringify({

            status: order.status,

            carrier: order.carrier,

            trackingNumber:
              order.trackingNumber,

            estimatedDelivery:
              order.estimatedDelivery

          })

        }

      );



      const data =
        await response.json();



      if(!response.ok){

        throw new Error(
          data.message || "Update failed"
        );

      }




      Swal.fire(
        "Updated!",
        "Order updated successfully",
        "success"
      );



      loadOrders();



    }catch(error){


      Swal.fire(
        "Error",
        error.message,
        "error"
      );


    }


  };









  const changeValue = (id, field, value)=>{


    setOrders(

      orders.map(order =>

        order._id === id

        ?

        {
          ...order,
          [field]:value
        }

        :

        order

      )

    );


  };








  if(loading){

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

        ⚙️ Admin Orders

      </h2>





      {
        orders.map(order=>(


          <div

            className="card shadow-sm mb-4"

            key={order._id}

          >


            <div className="card-body">



              <h4>

                📦 Order #

                {
                  order._id.slice(-6)
                }

              </h4>




              <p>

                👤 Customer:

                {" "}

                {order.userEmail}

              </p>




              <p>

                💳 Payment:

                {" "}

                <strong>

                {
                  order.method === "Stripe Gateway"

                  ?

                  "Stripe"

                  :

                  "Cash On Delivery"

                }

                </strong>

              </p>





              <p>

                💰 Total:

                {" "}

                <strong className="text-success">

                  $

                  {Number(order.total).toFixed(2)}

                </strong>

              </p>





              <hr />





              <div className="row">

                <div className="col-md-3">

                  <label>
                    Status
                  </label>

                  <select

                    className="form-select"

                    value={order.status || "Pending"}

                    onChange={(e)=>

                      changeValue(
                        order._id,
                        "status",
                        e.target.value
                      )

                    }

                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Processing">
                      Processing
                    </option>

                    <option value="Shipped">
                      Shipped
                    </option>

                    <option value="Delivered">
                      Delivered
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

                <div className="col-md-3">


                  <label>
                    Carrier
                  </label>


                  <input

                    className="form-control"

                    value={
                      order.carrier || ""
                    }


                    placeholder="DHL"

                    onChange={(e)=>

                      changeValue(
                        order._id,
                        "carrier",
                        e.target.value
                      )

                    }

                  />


                </div>






                <div className="col-md-3">


                  <label>
                    Tracking
                  </label>


                  <input

                    className="form-control"

                    value={
                      order.trackingNumber || ""
                    }


                    placeholder="JD83738273"


                    onChange={(e)=>

                      changeValue(
                        order._id,
                        "trackingNumber",
                        e.target.value
                      )

                    }

                  />


                </div>






                <div className="col-md-3">


                  <label>
                    Delivery
                  </label>


                  <input

                    className="form-control"

                    value={
                      order.estimatedDelivery || ""
                    }


                    placeholder="29 Jul 2026"


                    onChange={(e)=>

                      changeValue(
                        order._id,
                        "estimatedDelivery",
                        e.target.value
                      )

                    }

                  />


                </div>



              </div>






              <button

                className="btn btn-success mt-4"

                onClick={()=>updateOrder(order)}

              >

                💾 Save Order

              </button>





            </div>


          </div>


        ))

      }



    </div>

  );

}


export default AdminOrders;