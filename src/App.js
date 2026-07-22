import Navbar from "./components/Navbar";
import ProductsList from "./components/ProductsList";
import Slider from "./components/Slider";
import About from "./components/About";
import ProductDetails from "./components/ProductDetails";
import Cart from "./components/Cart";
import Orders from "./components/Orders";

import Home from "./components/Home";
import Products from "./components/Products";
import AddProduct from "./components/AddProduct";
import EditProduct from "./components/EditProduct";

import NotFound from "./components/NotFound";
import Login from "./components/Login";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";

import "./App.css";

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <div className="App">
      <Navbar />

      <div className="container mt-4">
        <Routes>

          {/* Customer */}
          <Route
            path="/"
            element={
              <>
                <Slider />
                <ProductsList />
              </>
            }
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/product/:productId"
            element={<ProductDetails />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          {/* Admin */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products/add"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products/edit/:productId"
            element={
              <ProtectedRoute>
                <EditProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
