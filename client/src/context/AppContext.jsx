// src/context/AppContext.jsx
import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // Global state variables
  const [user, setUser] = useState(null); // Stores current user (hotel, seller, admin)
  const [isSeller, setIsSeller] = useState(false); // Tracks if current user is a seller
  const [showUserLogin, setShowUserLogin] = useState(false); // For toggling login UI if needed

  // Context value that will be shared across the app
  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => {
  return useContext(AppContext);
};
