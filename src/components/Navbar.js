import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const { user, logout } = useAuth();

  const closeMenu = () => setIsOpen(false);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      const total = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      setCartCount(total);
    } catch {
      setCartCount(0);
    }
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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
      <div className="container-fluid">

        <Link
          className="navbar-brand fw-bold"
          to="/"
          onClick={closeMenu}
        >
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


            {/* All Users */}
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/"
                onClick={closeMenu}
              >
                Home
              </Link>
            </li>


            <li className="nav-item">
              <Link
                className="nav-link"
                to="/about"
                onClick={closeMenu}
              >
                About
              </Link>
            </li>


            {/* Cart - Guest + Customer + Admin */}
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/cart"
                onClick={closeMenu}
              >
                🛒 Cart

                {cartCount > 0 && (
                  <span className="badge bg-danger ms-1">
                    {cartCount}
                  </span>
                )}

              </Link>
            </li>



            {/* Customer */}
            {user?.role === "customer" && (
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/orders"
                  onClick={closeMenu}
                >
                  Orders
                </Link>
              </li>
            )}

            {user?.role === "driver" && (
              <>
                <Link
                  className="nav-link"
                  to="/orders"
                  onClick={closeMenu}
                >
                  Orders
                </Link>

                <a
                  className="nav-link"
                  href="/order-check.html"
                >
                  Driver
                </a>
              </>
            )}



            {/* Admin */}
            {user?.role === "admin" && (

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
                    >
                      Dashboard
                    </Link>
                  </li>


                  <li>
                    <Link
                      className="dropdown-item"
                      to="/admin/products"
                    >
                      Manage Products
                    </Link>
                  </li>


                  <li>
                    <Link
                      className="dropdown-item"
                      to="/admin/products/add"
                    >
                      Add Product
                    </Link>
                  </li>


                  <li>
                    <hr className="dropdown-divider" />
                  </li>


                  <li>
                    <Link
                      className="dropdown-item"
                      to="/orders"
                    >
                      View Orders
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/admin/orders"
                    >
                      Edit Orders
                    </Link>
                  </li>


                </ul>

              </li>

            )}


          </ul>



          {/* Right Side */}

          <ul className="navbar-nav align-items-center">


            {user ? (

              <>

                <li className="nav-item">
                  <span className="nav-link">
                    Hi, {user.name}
                  </span>
                </li>


                <li className="nav-item ms-2">

                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={logout}
                  >
                    Logout
                  </button>

                </li>

              </>


            ) : (

              <>

                <li className="nav-item me-2">

                  <Link
                    className="btn btn-outline-success btn-sm"
                    to="/login"
                  >
                    Login
                  </Link>

                </li>


                <li className="nav-item">

                  <Link
                    className="btn btn-primary btn-sm"
                    to="/register"
                  >
                    Register
                  </Link>

                </li>

              </>

            )}


          </ul>


        </div>

      </div>
    </nav>
  );
}

export default Navbar;