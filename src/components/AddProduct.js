import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { authFetch, API_URL } from "../api";

function AddProduct() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const formSubmit = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !description.trim() ||
      !image.trim() ||
      !category.trim()
    ) {
      Swal.fire(
        "Warning",
        "Please fill in all required fields.",
        "warning"
      );
      return;
    }

    if (Number(price) <= 0) {
      Swal.fire(
        "Warning",
        "Price must be greater than zero.",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await authFetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          price: Number(price),
          description: description.trim(),
          image: image.trim(),
          category: category.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product.");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Product added successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin/products");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-md-6 mx-auto py-4">
      <div className="card shadow border-0">
        <div className="card-body">
          <h2 className="text-center mb-4">
            Add Product
          </h2>

          <form onSubmit={formSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Product Title
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Wireless Mouse"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Price ($)
              </label>

              <input
                type="number"
                className="form-control"
                min="0.01"
                step="0.01"
                placeholder="99.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Image URL
              </label>

              <input
                type="url"
                className="form-control"
                placeholder="https://example.com/image.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Category
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="electronics"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">
                Description
              </label>

              <textarea
                rows="4"
                className="form-control"
                placeholder="Enter product description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Adding...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;