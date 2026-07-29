import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { authFetch, ORDERS_URL } from "../api";


function OrderDetails() {


  const { id } = useParams();


  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);




  useEffect(() => {

    loadOrder();

  }, []);






  const loadOrder = async () => {


    try {


      const response =
        await authFetch(
          `${ORDERS_URL}/${id}`
        );



      if (!response.ok) {

        throw new Error(
          "Order not found"
        );

      }



      const data =
        await response.json();



      setOrder(data);



    } catch(error) {


      Swal.fire(
        "Error",
        error.message,
        "error"
      );


    } finally {


      setLoading(false);


    }


  };








  const getStepClass = (done)=>{


    return done
      ? "text-success"
      : "text-muted";


  };








  if(loading){


    return (

      <div className="container py-5 text-center">

        <h4>
          Loading Order Details...
        </h4>

      </div>

    );

  }







  if(!order){


    return (

      <div className="container py-5 text-center">


        <h4>
          Order not found
        </h4>


        <Link
          to="/orders"
          className="btn btn-primary mt-3"
        >

          Back To Orders

        </Link>


      </div>

    );

  }







  return (


    <div className="container py-4">



      <Link
        to="/orders"
        className="btn btn-secondary mb-4"
      >

        ← Back Orders

      </Link>






      <div className="card shadow">


        <div className="card-body">





          <h2>

            📦 Order #

            {
              order.orderNumber ||
              order._id.slice(-6)
            }

          </h2>




          <hr />







          {/* Customer */}


          <h4>
            👤 Customer Information
          </h4>



          <p>

            <strong>
              Email:
            </strong>

            {" "}

            {order.userEmail}

          </p>




          <p>

            <strong>
              Order Date:
            </strong>

            {" "}

            {
              new Date(
                order.date
              ).toLocaleString()
            }

          </p>








          {/* Payment */}



          <hr />



          <h4>
            💳 Payment Details
          </h4>



          <p>

            <strong>
              Method:
            </strong>

            {" "}

            {
              order.method
            }

          </p>




          {
            order.method === "Stripe Gateway" &&

            <div className="alert alert-success">


              <p>

                💳 Stripe Payment

              </p>



              <p>

                <strong>
                  Payment ID:
                </strong>

                {" "}

                {
                  order.paymentIntentId ||
                  "Not available"
                }

              </p>




              <p>

                <strong>
                  Payment Status:
                </strong>

                {" "}

                {
                  order.paymentStatus ||
                  "succeeded"
                }

              </p>



              <p>

                <strong>
                  Currency:
                </strong>

                {" "}

                USD

              </p>



            </div>


          }








          {/* Shipping */}



          <hr />



          <h4>
            🚚 Shipping Information
          </h4>



          <div className="row">


            <div className="col-md-4">

              <strong>
                Carrier
              </strong>


              <p>

                {
                  order.carrier ||
                  "Not assigned"
                }

              </p>


            </div>





            <div className="col-md-4">

              <strong>
                Tracking
              </strong>


              <p>

                {
                  order.trackingNumber ||
                  "Not available"
                }

              </p>


            </div>





            <div className="col-md-4">

              <strong>
                Estimated Delivery
              </strong>


              <p>

                {
                  order.estimatedDelivery ||
                  "Not available"
                }

              </p>


            </div>



          </div>








          {/* Address */}



          <hr />



          <h4>
            🏠 Shipping Address
          </h4>



          {

          order.shippingAddress ? (


            <div className="border rounded p-3">


              <p>

                {
                  order.shippingAddress.fullName
                }

              </p>


              <p>

                {
                  order.shippingAddress.phone
                }

              </p>



              <p>

                {
                  order.shippingAddress.street
                }

              </p>



              <p>

                {
                  order.shippingAddress.city
                }

                ,

                {" "}

                {
                  order.shippingAddress.country
                }

              </p>



            </div>


          )

          :

          (

            <p className="text-muted">

              No shipping address added

            </p>

          )

          }










          {/* Products */}



          <hr />



          <h4>
            🛒 Products
          </h4>





          {

          order.items?.map(
            (item,index)=>(


              <div

                key={index}

                className="
                d-flex
                align-items-center
                gap-3
                border-bottom
                py-3
                "

              >



                <img

                  src={item.image}

                  alt={item.title}

                  width="90"

                  height="90"

                  style={{
                    objectFit:"contain"
                  }}

                />





                <div>


                  <h6>

                    {item.title}

                  </h6>



                  <p>

                    Quantity:

                    {" "}

                    {item.quantity}

                  </p>



                  <strong className="text-success">

                    $

                    {
                      (
                        item.price *
                        item.quantity
                      ).toFixed(2)
                    }

                  </strong>



                </div>



              </div>


            ))

          }







          <h3 className="text-end text-success mt-4">


            Total:

            {" "}

            $

            {
              Number(order.total)
              .toFixed(2)
            }


          </h3>









          {/* Timeline */}




          <hr />



          <h4>
            📍 Order Timeline
          </h4>





          <div className="mt-3">


            <p className="text-success">
              🛒 Order Created
            </p>



            <p
              className={
                getStepClass(
                  order.method
                )
              }
            >

              💳 Payment Completed

            </p>




            <p
              className={
                getStepClass(
                  [
                    "Processing",
                    "Shipped",
                    "Delivered"
                  ]
                  .includes(order.status)
                )
              }
            >

              ⚙️ Processing

            </p>




            <p
              className={
                getStepClass(
                  [
                    "Shipped",
                    "Delivered"
                  ]
                  .includes(order.status)
                )
              }
            >

              🚚 Shipped

            </p>




            <p
              className={
                getStepClass(
                  order.status === "Delivered"
                )
              }
            >

              📦 Delivered

            </p>



          </div>






        </div>


      </div>



    </div>


  );


}



export default OrderDetails;