import Product from "./Product";
import Spinner from "./Spinner";
import { useEffect, useState } from "react";
import { API_URL } from "../api";


function ProductsList() {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);



  useEffect(() => {

    loadProducts();

  }, [page]);



  const loadProducts = async () => {

    try {

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



    } catch(error) {

      console.log(error);

      setProducts([]);

    } finally {

      setLoading(false);

    }

  };




  if(loading)
    return <Spinner text="Loading Store Products..." />;



  return (

    <div className="container py-4">


      <div className="row">


        {products.map((product)=>(


          <div
            className="col-md-3 mb-4"
            key={product.id}
          >

            <Product product={product}/>

          </div>


        ))}


      </div>





      <div className="d-flex justify-content-center mt-4">


        <button

          className="btn btn-dark mx-1"

          disabled={page === 1}

          onClick={() => setPage(page - 1)}

        >

          Previous

        </button>




        {[...Array(totalPages)].map((_,index)=>(


          <button

            key={index}

            className={
              `btn mx-1 ${
                page === index + 1
                ? "btn-primary"
                : "btn-outline-primary"
              }`
            }


            onClick={() => setPage(index + 1)}

          >

            {index + 1}

          </button>


        ))}




        <button

          className="btn btn-dark mx-1"

          disabled={page === totalPages}

          onClick={() => setPage(page + 1)}

        >

          Next

        </button>


      </div>



    </div>

  );

}


export default ProductsList;