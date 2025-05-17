import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(res.data);
      } catch (err) {
        console.warn('사용자 정보를 불러오지 못했습니다.');
        setUser(null);
      }
    };

    if (token) {
      fetchUser();
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
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);