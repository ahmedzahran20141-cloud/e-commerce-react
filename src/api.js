export const API_URL = "http://localhost:9000/products";
export const AUTH_URL = "http://localhost:9000/login";
export const REGISTER_URL = "http://localhost:9000/register";
export const ORDERS_URL = "http://localhost:9000/orders";
export const UPLOAD_URL = "http://localhost:9000/upload";
export const PAYMENT_URL = "http://localhost:9000/create-payment-intent";

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authUnintendedLogout"));
    throw new Error("Unauthorized session.");
  }

  return response;
};