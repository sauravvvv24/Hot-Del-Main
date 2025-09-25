// client/src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  // Fetch cart items when user changes
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user || !user._id) {
        setCartItems([]);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/cart/${user._id}`);
        setCartItems(response.data.items || []);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setCartItems([]);
      }
    };

    fetchCartItems();
  }, [user]);

  const addToCart = (product) => {
    setCartItems((prev) => [...prev, product]);
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter(item => item._id !== id));
  };

  const updateCartCount = () => {
    // Refresh cart items from server
    if (user) {
      axios.get(`http://localhost:3000/api/cart/${user._id}`)
        .then(response => {
          console.log('Updated cart response:', response.data);
          if (response.data.items) {
            setCartItems(response.data.items);
          } else if (Array.isArray(response.data)) {
            setCartItems(response.data);
          } else {
            setCartItems([]);
          }
        })
        .catch(error => {
          console.error('Error updating cart count:', error);
        });
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateCartCount,
      cartCount: cartItems.length 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
