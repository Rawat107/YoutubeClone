import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    if (!stored || stored === "undefined") {
      localStorage.removeItem("user");
      return null;
    }
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user and token exist
    const token = localStorage.getItem('token');
    if (user && !token) {
      setUser(null);
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, [user]);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAuthenticated = () => {
    return user !== null && localStorage.getItem('token') !== null;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
