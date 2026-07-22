import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:9000/products';

function AddProduct() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const formSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(API_URL);
    const allProducts = await res.json();
    const nextId = allProducts.length > 0 ? Math.max(...allProducts.map(p => Number(p.id))) + 1 : 1;
    
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: nextId,
        title,
        price: Number(price),
        description,
        image,
        category
      }),
    });
    
    Swal.fire('Success!', 'Product Added', 'success');
    navigate('/admin/products');
  };

  return (
    <div className="col-md-6 mx-auto">
      <h1 className="mb-3">Add Product</h1>
      <form onSubmit={formSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input className="form-control" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <input
          className="form-control"
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "" || Number(value) > 0) {
              setPrice(value);
            }
          }}
          required
        />
        <div className="mb-3">
          <label className="form-label">Image URL</label>
          <input className="form-control" type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
        </div>
        <div className="mb-3">
          <label className="form-label">Category</label>
          <input className="form-control" type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
        </div>
        <button className="btn btn-primary w-100">Add Product</button>
      </form>
    </div>
  );
}

export default AddProduct;
