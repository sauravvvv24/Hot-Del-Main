// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUserString = localStorage.getItem('user');
      if (!storedUserString) return null;
      
      const storedUser = JSON.parse(storedUserString);
      // Fix for existing users without role property
      if (storedUser && !storedUser.role) {
        // If user has hotel-specific fields, set role to 'hotel'
        if (storedUser.address || storedUser.type) {
          storedUser.role = 'hotel';
        }
        // Update localStorage with the fixed user object
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
      return storedUser;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      // Clear invalid data from localStorage
      localStorage.removeItem('user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for use in components
export const useAuth = () => useContext(AuthContext);
