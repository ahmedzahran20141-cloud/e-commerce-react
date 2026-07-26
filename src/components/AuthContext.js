import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_URL, REGISTER_URL } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  useEffect(() => {
    const handleForceLogout = () => {
      setToken(null);
      setUser(null);
      navigate("/login", { replace: true });
    };

    window.addEventListener("authUnintendedLogout", handleForceLogout);
    return () => window.removeEventListener("authUnintendedLogout", handleForceLogout);
  }, [navigate]);

  const login = async (email, password) => {
    try {
      const response = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;
      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch("http://localhost:9000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      return data;
    } catch (err) {
      return {
        success: false,
        message: "Cannot connect to server.",
      };
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
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}