import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(Boolean(token));
    setLoading(false);
  }, []);

  const login = (token = 'demo') => {
    localStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
