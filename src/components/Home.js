import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../api";

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setCategories([...new Set(data.map((p) => p.category).filter(Boolean))]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center mt-5">
        <h2>Loading...</h2>
      </div>
    );

  return (
    <>
      <section className="bg-dark text-white py-5 rounded mb-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold">Admin Dashboard</h1>
          <p className="lead mt-3">Manage your store products here.</p>
          <Link to="/admin/products" className="btn btn-primary btn-lg mt-3">
            Manage Products
          </Link>
        </div>
      </section>
      <section className="py-5 bg-light rounded mb-5">
        <div className="container">
          <h2 className="text-center mb-4">Categories Count</h2>
          <div className="row">
            {categories.map((cat) => (
              <div className="col-md-3 mb-3" key={cat}>
                <div className="p-3 border rounded text-center shadow-sm bg-white">
                  <h5 className="text-capitalize">{cat}</h5>
                  <p>{products.filter((p) => p.category === cat).length} Products</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;