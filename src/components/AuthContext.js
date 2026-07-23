import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_URL } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      localStorage.removeItem("user");
      return null;
    }
  });


  const login = async (email, password) => {
    try {
      console.log("Sending login:", {
        email,
        password,
      });

      const response = await fetch(AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });


      console.log("Status:", response.status);


      const data = await response.json();


      console.log("Response:", data);


      if (!response.ok) {
        return false;
      }


      if (!data.token || !data.user) {
        console.log("Token or user missing");
        return false;
      }


      localStorage.setItem(
        "token",
        data.token
      );


      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );


      setToken(data.token);
      setUser(data.user);


      navigate("/admin");


      return true;


    } catch (error) {

      console.error(
        "Login Error:",
        error
      );

      return false;
    }
  };


  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");


    setToken(null);

    setUser(null);


    navigate("/login");
  };


  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}