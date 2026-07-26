import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Spinner from "./Spinner";
import { authFetch, API_URL } from "../api";


function Products() {

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

  const [products,setProducts] = useState([]);

  const [loading,setLoading] = useState(true);

  const [page,setPage] = useState(1);

  const [totalPages,setTotalPages] = useState(1);




  useEffect(()=>{

    getAllProducts();

  },[page]);





  const getAllProducts = async()=>{

    try{

      setLoading(true);


      const response = await fetch(
        `${API_URL}?page=${page}&limit=8`
      );


      const data = await response.json();



      setProducts(
        Array.isArray(data.products)
        ? data.products
        : []
      );


      setTotalPages(
        data.totalPages || 1
      );



    }catch(error){

      console.log(error);

      setProducts([]);

    }
    finally{

      setLoading(false);

    }

  };





  const deleteProduct = (product)=>{


    Swal.fire({

      title:`Delete ${product.title}?`,

      showCancelButton:true,

      confirmButtonColor:"#d33",

      confirmButtonText:"Yes, delete it!"

    })

    .then(async(result)=>{


      if(result.isConfirmed){


        await authFetch(

          `${API_URL}/${product.id}`,

          {
            method:"DELETE"
          }

        );


        Swal.fire(
          "Deleted!",
          "",
          "success"
        );


        getAllProducts();


      }


    });


  };





  if(loading)
    return <Spinner text="Loading Products..." />;




  return (

    <>


      <div className="d-flex justify-content-between align-items-center mb-4">


        <h2>
          Manage Products
        </h2>



        <Link
          to="/admin/products/add"
          className="btn btn-success"
        >

          + Add Product

        </Link>


      </div>





      <table className="table table-striped">


        <thead>

          <tr>

            <th>ID</th>

            <th>Image</th>

            <th>Title</th>

            <th>Price</th>

            <th>Actions</th>

          </tr>

        </thead>




        <tbody>


        {products.map((p)=>(


          <tr key={p.id}>


            <td>{p.id}</td>


            <td>

              <img
                src={p.image}
                alt={p.title}
                width="50"
                onError={(e)=>{
                  e.target.onerror=null;
                  e.target.src=backupImage;
                }}
              />

            </td>


            <td>{p.title}</td>


            <td>${p.price}</td>



            <td>


              <button

                className="btn btn-danger btn-sm me-2"

                onClick={()=>deleteProduct(p)}

              >

                Delete

              </button>



              <Link

                to={`/admin/products/edit/${p.id}`}

                className="btn btn-primary btn-sm"

              >

                Edit

              </Link>


            </td>



          </tr>


        ))}


        </tbody>


      </table>





      <div className="d-flex justify-content-center mt-4">



        <button

          className="btn btn-dark mx-1"

          disabled={page===1}

          onClick={()=>setPage(page-1)}

        >

          Previous

        </button>





        {[...Array(totalPages)].map((_,index)=>(


          <button

            key={index}

            className={
              `btn mx-1 ${
                page===index+1
                ?"btn-primary"
                :"btn-outline-primary"
              }`
            }


            onClick={()=>setPage(index+1)}

          >

            {index+1}

          </button>


        ))}




        <button

          className="btn btn-dark mx-1"

          disabled={page===totalPages}

          onClick={()=>setPage(page+1)}

        >

          Next

        </button>



      </div>


    </>

  );

}


export default Products;