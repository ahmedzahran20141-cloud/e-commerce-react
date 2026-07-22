import { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { admin1 } from "./TypeEmail";
import { admin2 } from "./TypeEmail";

const password1 = atob(admin1.password);
const password2 = atob(admin2.password);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();

  const login = (email, password) => {
    if ((email === admin1.email && password === password1) || (email === admin2.email && password === password2)) {
      const fakeUser = { email, role: 'admin' };
      localStorage.setItem('user', JSON.stringify(fakeUser));
      setUser(fakeUser);
      navigate('/admin');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
