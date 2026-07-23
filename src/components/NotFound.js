import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="text-center p-5 bg-white rounded-4 shadow"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <div className="display-1 mb-3">😕</div>
        <h1 className="display-1 fw-bold text-danger">404</h1>
        <h2 className="fw-semibold mb-3">Oops! Page Not Found</h2>
        <p className="text-muted mb-4">the URL may be incorrect.</p>
        <Link to="/" className="btn btn-dark btn-lg px-4">
          🏠 Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;