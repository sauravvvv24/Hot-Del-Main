// src/api/order.js
import axios from 'axios';

const API = 'http://localhost:3000/api/orders';

export const placeOrder = async (hotelId) => {
  return await axios.post(`${API}/place`, { hotelId });
};

export const getOrders = async (hotelId) => {
  return await axios.get(`${API}/${hotelId}`);
};

export const getOrderById = async (orderId) => {
  return await axios.get(`http://localhost:3000/api/orders/${orderId}`);
};

export const getMyProducts = async (token) => {
  try {
    console.log('Making request to get products with token:', token ? 'Token present' : 'No token');
    const response = await axios.get('http://localhost:3000/api/products/mine', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Products API response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getMyProducts API call:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      headers: error.response?.headers,
      token: token ? 'Present' : 'Missing'
    });
    throw error;
  }
};

export const getSellerOrders = async (token) => {
  return await axios.get('http://localhost:3000/api/orders/seller', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateOrderStatus = async (orderId, status, token, expectedDeliveryDate = null) => {
  const data = { status };
  if (expectedDeliveryDate) {
    data.expectedDeliveryDate = expectedDeliveryDate;
  }
  
  return await axios.put(`http://localhost:3000/api/orders/${orderId}/status`, 
    data, 
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
