import Product from "./Product";
import Spinner from "./Spinner";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:9000/products";

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setCategories([
          ...new Set(data.map((p) => p.category).filter(Boolean)),
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (p) => p.category === selectedCategory
        );

  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  const startIndex = (currentPage - 1) * productsPerPage;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const changeCategory = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <Spinner text="Loading Store Products..." />;
  }

  return (
    <div className="container py-4">
      <select
        className="form-select my-3"
        value={selectedCategory}
        onChange={changeCategory}
      >
        <option value="all">All Categories</option>

        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <div className="row">
        {currentProducts.map((product) => (
          <div
            className="col-md-3 mb-4"
            key={product.id}
          >
            <Product product={product} />
          </div>
        ))}
      </div>

      <nav>
        <ul className="pagination justify-content-center">
          <li
            className={`page-item ${
              currentPage === 1 ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() =>
                setCurrentPage(currentPage - 1)
              }
            >
              Previous
            </button>
          </li>

          {[...Array(totalPages)].map((_, index) => (
            <li
              key={index}
              className={`page-item ${
                currentPage === index + 1
                  ? "active"
                  : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() =>
                  setCurrentPage(index + 1)
                }
              >
                {index + 1}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage === totalPages
                ? "disabled"
                : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() =>
                setCurrentPage(currentPage + 1)
              }
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default ProductsList;