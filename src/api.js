export const API_URL =
  "http://localhost:9000/products";


export const AUTH_URL =
  "http://localhost:9000/login";



export const authFetch = async (
  url,
  options = {}
) => {

  const token =
    localStorage.getItem("token");


  const headers = {

    "Content-Type":
      "application/json",

    ...(options.headers || {}),

  };


  if (token) {

    headers["Authorization"] =
      `Bearer ${token}`;

  }


  const response = await fetch(
    url,
    {
      ...options,
      headers,
    }
  );


  if (
    response.status === 401 ||
    response.status === 403
  ) {

    localStorage.removeItem("token");

    localStorage.removeItem("user");


    window.location.href =
      "/login";


    throw new Error(
      "Unauthorized"
    );
  }


  return response;
};