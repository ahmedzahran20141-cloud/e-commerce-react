import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { authFetch, API_URL, UPLOAD_URL } from "../api";

function AddProduct() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageType, setImageType] = useState("upload");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const formSubmit = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !description.trim() ||
      !category.trim()
    ) {
      Swal.fire(
        "Warning",
        "Please fill all fields.",
        "warning"
      );
      return;
    }

    if (imageType === "upload" && !imageFile) {
      Swal.fire(
        "Warning",
        "Please choose an image.",
        "warning"
      );
      return;
    }

    if (imageType === "url" && !imageUrl.trim()) {
      Swal.fire(
        "Warning",
        "Please enter image URL.",
        "warning"
      );
      return;
    }


    try {
      setLoading(true);

      let finalImage = "";


      // Upload using Multer
      if (imageType === "upload") {

        const formData = new FormData();
        formData.append("image", imageFile);


        const uploadRes = await authFetch(UPLOAD_URL, {
          method: "POST",
          body: formData,
        });


        const uploadData = await uploadRes.json();


        if (!uploadRes.ok) {
          throw new Error(
            uploadData.message || "Image upload failed"
          );
        }


        finalImage = uploadData.imageUrl;

      } 

      // Use image URL
      else {

        finalImage = imageUrl.trim();

      }



      const postRes = await authFetch(API_URL, {
        method: "POST",

        body: JSON.stringify({

          title: title.trim(),

          price: Number(price),

          description: description.trim(),

          image: finalImage,

          category: category.trim(),

        }),
      });


      const postData = await postRes.json();


      if (!postRes.ok) {
        throw new Error(
          postData.message || "Failed to add product"
        );
      }


      Swal.fire(
        "Success!",
        "Product Added Successfully",
        "success"
      );


      navigate("/admin/products");


    } catch (error) {

      Swal.fire(
        "Error",
        error.message,
        "error"
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="col-md-6 mx-auto py-4">

      <div className="card shadow p-4 border-0">

        <h1 className="h3 mb-4 text-center">
          Add Product
        </h1>


        <form onSubmit={formSubmit}>


          <input
            className="form-control mb-3"
            placeholder="Title"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
          />


          <input
            className="form-control mb-3"
            type="number"
            step="0.01"
            placeholder="Price"
            value={price}
            onChange={(e)=>setPrice(e.target.value)}
          />



          <select
            className="form-select mb-3"
            value={imageType}
            onChange={(e)=>setImageType(e.target.value)}
          >

            <option value="upload">
              Upload Image
            </option>

            <option value="url">
              Image URL
            </option>

          </select>



          {imageType === "upload" ? (

            <input
              className="form-control mb-3"
              type="file"
              accept="image/*"
              onChange={(e)=>
                setImageFile(e.target.files[0])
              }
            />

          ) : (

            <input
              className="form-control mb-3"
              type="text"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e)=>
                setImageUrl(e.target.value)
              }
            />

          )}



          <input
            className="form-control mb-3"
            placeholder="Category"
            value={category}
            onChange={(e)=>setCategory(e.target.value)}
          />



          <textarea
            className="form-control mb-3"
            rows="4"
            placeholder="Description"
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
          />



          <button
            className="btn btn-primary w-100"
            disabled={loading}
          >

            {loading ? "Adding..." : "Add Product"}

          </button>


        </form>

      </div>

    </div>
  );
}

export default AddProduct;