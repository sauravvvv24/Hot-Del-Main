// src/api/wishlist.js
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/wishlist';

// Get user's wishlist
export const getWishlist = async (token) => {
  try {
    const response = await axios.get(API_BASE, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get wishlist error:', error);
    throw error;
  }
};

// Add product to wishlist
export const addToWishlist = async (productId, token) => {
  try {
    const response = await axios.post(API_BASE, 
      { productId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Add to wishlist error:', error);
    throw error;
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (productId, token) => {
  try {
    const response = await axios.delete(`${API_BASE}/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    throw error;
  }
};

// Clear entire wishlist
export const clearWishlist = async (token) => {
  try {
    const response = await axios.delete(API_BASE, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Clear wishlist error:', error);
    throw error;
  }
};

// Check if product is in wishlist
export const checkWishlistStatus = async (productId, token) => {
  try {
    const response = await axios.get(`${API_BASE}/check/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Check wishlist status error:', error);
    throw error;
  }
};
