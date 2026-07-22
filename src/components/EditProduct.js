import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Spinner from "./Spinner";

const API_URL = "http://localhost:9000/products";

function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/${productId}`);

        if (!res.ok) {
          throw new Error("Product not found");
        }

        const data = await res.json();

        setTitle(data.title || "");
        setPrice(data.price || "");
        setDescription(data.description || "");
        setImage(data.image || "");
        setCategory(data.category || "");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });

        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, navigate]);

  const submit = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !description.trim() ||
      !category.trim() ||
      !image.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Data",
        text: "Please fill all fields.",
      });
      return;
    }

    if (Number(price) <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Price",
        text: "Price must be greater than zero.",
      });
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: productId,
          title: title.trim(),
          price: Number(price),
          description: description.trim(),
          image: image.trim(),
          category: category.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Product updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin/products");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner text="Loading Product..." />;
  }

  return (
    <div className="container py-5">
      <div
        className="card shadow border-0 mx-auto"
        style={{ maxWidth: "700px" }}
      >
        <div className="card-body p-4">
          <h2 className="text-center mb-4">
            Edit Product
          </h2>

          {image && (
            <div className="text-center mb-4">
              <img
                src={image}
                alt={title}
                className="img-fluid rounded"
                style={{
                  height: "220px",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/300x220?text=No+Image";
                }}
              />
            </div>
          )}

          <form onSubmit={submit}>
            <input
              className="form-control mb-3"
              placeholder="Product Title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              required
            />

            <input
              type="number"
              className="form-control mb-3"
              value={price}
              min="0"
              onChange={(e) =>
                setPrice(e.target.value)
              }
              required
            />

            <input
              type="url"
              className="form-control mb-3"
              placeholder="Image URL"
              value={image}
              onChange={(e) =>
                setImage(e.target.value)
              }
              required
            />

            <input
              className="form-control mb-3"
              placeholder="Category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              required
            />

            <textarea
              className="form-control mb-4"
              rows="5"
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              required
            />

            <button
              className="btn btn-success w-100"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;