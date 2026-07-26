import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Spinner from "./Spinner";
import { authFetch, API_URL, UPLOAD_URL } from "../api";

function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/${productId}`);
        if (!res.ok) throw new Error("Product not found");

        const data = await res.json();
        setTitle(data.title || "");
        setPrice(data.price || "");
        setDescription(data.description || "");
        setImage(data.image || "");
        setCategory(data.category || "");
      } catch (error) {
        Swal.fire("Error", error.message, "error");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, navigate]);

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      let finalImageUrl = image;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadRes = await authFetch(UPLOAD_URL, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("New image upload failed");
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.imageUrl;
      }

      const response = await authFetch(`${API_URL}/${productId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title.trim(),
          price: Number(price),
          description: description.trim(),
          image: finalImageUrl,
          category: category.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to update product");

      Swal.fire("Success", "Product updated successfully", "success");
      navigate("/admin/products");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner text="Loading Product..." />;

  return (
    <div className="container py-5">
      <div className="card shadow border-0 mx-auto" style={{ maxWidth: "700px" }}>
        <div className="card-body p-4">
          <h2 className="text-center mb-4">Edit Product</h2>
          <form onSubmit={submit}>
            <input className="form-control mb-3" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input type="number" className="form-control mb-3" value={price} onChange={(e) => setPrice(e.target.value)} required />
            
            <div className="mb-3">
              <label className="form-label">Replace Image (Multer File Upload)</label>
              <input type="file" className="form-control" onChange={(e) => setImageFile(e.target.files[0])} />
            </div>

            <input className="form-control mb-3" value={category} onChange={(e) => setCategory(e.target.value)} required />
            <textarea className="form-control mb-4" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required />

            <button className="btn btn-success w-100" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;