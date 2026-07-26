import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { authFetch, ORDERS_URL } from "../api";

function Orders() {

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


  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    loadOrders();

  }, []);




  const loadOrders = async () => {

    try {


      const response =
        await authFetch(ORDERS_URL);



      if (!response.ok) {

        throw new Error(
          "Failed to load orders"
        );

      }



      const data =
        await response.json();



      setOrders(
        Array.isArray(data)
          ? data
          : []
      );



    } catch(error) {


      console.log(error);

      setOrders([]);


    } finally {


      setLoading(false);


    }

  };





  const deleteOrder = async (id) => {


    const result =
      await Swal.fire({

        title: "Delete Order?",

        text:
        "This order will be removed permanently.",

        icon: "warning",

        showCancelButton: true,

        confirmButtonText: "Delete",

        confirmButtonColor: "#d33",

      });



    if(result.isConfirmed){


      try {


        const response =
          await authFetch(
            `${ORDERS_URL}/${id}`,
            {
              method:"DELETE"
            }
          );



        if(!response.ok){

          throw new Error(
            "Failed to delete order"
          );

        }



        setOrders(
          orders.filter(
            (order)=> order._id !== id
          )
        );



        Swal.fire(
          "Deleted!",
          "Order removed.",
          "success"
        );



      } catch(error){


        Swal.fire(
          "Error",
          error.message,
          "error"
        );


      }


    }


  };





  if(loading){

    return (

      <div className="container py-4 text-center">

        <h4>
          Loading Orders...
        </h4>

      </div>

    );

  }





  return (

    <div className="container py-4">


      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2>
          📦 Order History
        </h2>

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


        orders.map((order)=>(


          <div
            className="card shadow-sm mb-4"
            key={order._id}
          >


            <div className="card-body">



              <div className="d-flex justify-content-between">


                <div>


                  <h5>
                    Order #{order._id.slice(-6)}
                  </h5>



                  <p className="text-muted mb-1">

                    Date:

                    {" "}

                    {new Date(
                      order.date
                    ).toLocaleString()}

                  </p>



                  {order.userEmail && (

                    <p className="mb-1">

                      Customer:
                      {" "}
                      {order.userEmail}

                    </p>

                  )}


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





              <h5 className="mb-3">

                Products:

              </h5>





              {order.items?.map((item,index)=>(


                <div

                  key={`${item.id}-${index}`}

                  className="
                  d-flex 
                  flex-column 
                  flex-md-row 
                  justify-content-between 
                  align-items-center 
                  border-bottom 
                  py-2 
                  gap-3
                  "

                >



                  <div className="d-flex align-items-center gap-3 w-100">


                    <img

                      src={item.image}

                      alt={item.title}

                      width="80"

                      height="80"

                      style={{
                        objectFit:"contain"
                      }}


                      onError={(e)=>{

                        e.target.onerror=null;

                        e.target.src=backupImage;

                      }}

                    />



                    <span className="fw-semibold text-break">

                      {item.title}

                    </span>


                  </div>






                  <div className="text-nowrap ms-auto">


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

                  ${Number(order.total).toFixed(2)}

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