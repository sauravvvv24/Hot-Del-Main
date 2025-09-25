// src/api/cart.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const addToCart = async (userId, productId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/cart/add`, {
      hotelId: userId,
      productId,
      quantity: 1
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const getCart = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const updateCartItem = async (userId, productId, quantity) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/cart/update`, {
      userId,
      productId,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
};

export const removeFromCart = async (userId, productId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/cart/remove`, {
      data: { userId, productId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};
