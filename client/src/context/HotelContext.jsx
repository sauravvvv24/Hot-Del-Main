import React, { createContext, useState, useEffect } from 'react';

export const HotelContext = createContext();

export const HotelProvider = ({ children }) => {
  const [hotelUser, setHotelUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('hotelUser');
      if (storedUser) {
        setHotelUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error parsing hotelUser from localStorage:', error);
      localStorage.removeItem('hotelUser');
      setHotelUser(null);
    }
  }, []);

  const loginHotel = (userData) => {
    setHotelUser(userData);
    localStorage.setItem('hotelUser', JSON.stringify(userData));
  };

  const logoutHotel = () => {
    setHotelUser(null);
    localStorage.removeItem('hotelUser');
  };

  return (
    <HotelContext.Provider value={{ hotelUser, loginHotel, logoutHotel }}>
      {children}
    </HotelContext.Provider>
  );
};
