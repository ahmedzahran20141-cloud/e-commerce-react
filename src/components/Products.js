import { useEffect, useState, useMemo } from "react";
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

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 5;

  useEffect(() => {
    getAllProducts();
  }, []);

  const getAllProducts = () => {
    setLoading(true);

    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  };

  const deleteProduct = (product) => {
    Swal.fire({
      title: `Delete ${product.title}?`,
      imageUrl: product.image,
      imageWidth: 200,
      imageAlt: product.title,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await authFetch(`${API_URL}/${product.id}`, {
            method: "DELETE",
          });
          Swal.fire("Deleted!", "", "success");
          getAllProducts();
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => (category === "all" ? true : p.category === category))
      .sort((a, b) => {
        if (sort === "low") return a.price - b.price;
        if (sort === "high") return b.price - a.price;
        return 0;
      });
  }, [products, search, category, sort]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const resetPage = () => setCurrentPage(1);

  if (loading) return <Spinner text="Loading Products..." />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Products</h2>
        <Link to="/admin/products/add" className="btn btn-success">
          + Add Product
        </Link>
      </div>

      <div className="row g-2 mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              resetPage();
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              resetPage();
            }}
          >
            <option value="">Sort By Price</option>
            <option value="low">Low → High</option>
            <option value="high">High → Low</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th style={{ minWidth: "240px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  <img
                    src={product.image}
                    alt={product.title}
                    width="60"
                    height="60"
                    style={{ objectFit: "contain" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = backupImage;
                    }}
                  />
                </td>
                <td>{product.title}</td>
                <td>
                  <span className="badge bg-secondary">{product.category}</span>
                </td>
                <td>${product.price}</td>
                <td>
                  <div className="d-flex gap-2 flex-nowrap">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteProduct(product)}
                    >
                      Delete
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="btn btn-info btn-sm text-white"
                    >
                      View
                    </Link>
                    <Link
                      to={`/admin/products/edit/${product.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index}
                className={`page-item ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}

export default Products;