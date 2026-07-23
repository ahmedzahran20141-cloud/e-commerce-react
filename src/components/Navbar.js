import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const { user, logout } = useAuth();

  const closeMenu = () => setIsOpen(false);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(total);
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/" onClick={closeMenu}>
          Ahmed Store
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={closeMenu}>
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/about" onClick={closeMenu}>
                About
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/cart" onClick={closeMenu}>
                🛒 Cart
                {cartCount > 0 && (
                  <span className="badge bg-danger ms-2">{cartCount}</span>
                )}
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/orders" onClick={closeMenu}>
                Orders
              </Link>
            </li>

            {user && user.role === "admin" && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  Admin
                </a>

                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/admin"
                      onClick={closeMenu}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/admin/products"
                      onClick={closeMenu}
                    >
                      Manage Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/admin/products/add"
                      onClick={closeMenu}
                    >
                      Add Product
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>

          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">
                    Hi,&nbsp;{user.name || user.email}
                  </span>
                </li>

                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-outline-success btn-sm" to="/login">
                  Admin Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;