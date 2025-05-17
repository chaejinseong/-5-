// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      // 추후 사용자 정보 fetch 가능
      setUser({ email: 'dummy@example.com' });
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (tokenValue) => {
    localStorage.setItem('token', tokenValue);
    setToken(tokenValue);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);