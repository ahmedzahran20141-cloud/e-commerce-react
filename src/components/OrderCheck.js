import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authFetch, ORDERS_URL } from "../api";


function OrderCheck(){

  const {id}=useParams();

  const [order,setOrder]=useState(null);


  useEffect(()=>{

    loadOrder();

  },[]);



  const loadOrder=async()=>{

    try{

      const response =
        await authFetch(
          `${ORDERS_URL}/${id}`
        );


      const data =
        await response.json();


      setOrder(data);


    }catch(error){

      console.log(error);

    }

  };



  if(!order){

    return(
      <div className="container py-5 text-center">

        <h3>
          Loading Order...
        </h3>

      </div>
    );

  }



  return(

    <div className="container py-5">


      <div className="card shadow p-4">


        <h2>
          ✅ Ahmed Zahran Store
        </h2>


        <hr/>


        <h4>
          Order Verified
        </h4>


        <p>
          Order ID:
          {" "}
          {order._id}
        </p>


        <p>
          Customer:
          {" "}
          {order.userEmail}
        </p>


        <p>
          Payment:
          {" "}
          {order.method}
        </p>


        <p>
          Status:
          {" "}
          {order.status}
        </p>


        <p>
          Total:
          {" "}
          ${order.total}
        </p>


        <p>
          Date:
          {" "}
          {new Date(order.date).toLocaleDateString()}
        </p>



      </div>


    </div>

  );


}


export default OrderCheck;