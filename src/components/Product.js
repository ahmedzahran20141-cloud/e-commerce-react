import React from 'react';
import { Link } from 'react-router-dom';

function Product({ product }) {
  const backupImage =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
              font-size="50" fill="#6c757d">
          No Image
        </text>
      </svg>
    `);

  const truncatedDesc =
    product.description.length > 50
      ? product.description.substring(0, 50) + "..."
      : product.description;

  return (
    <div className="card h-100 shadow-sm">
      <img
        src={product.image}
        alt={product.title}
        className="card-img-top p-2"
        style={{ height: "200px", objectFit: "contain" }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = backupImage;
        }}
      />

      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.title}</h5>

        <p className="card-text text-muted flex-grow-1">
          {truncatedDesc}
        </p>

        <p className="fw-bold fs-5 text-success">${product.price}</p>

        <Link
          to={`/product/${product.id}`}
          className="btn btn-primary mt-auto"
        >
          Details
        </Link>
      </div>
    </div>
  );
}

export default Product;