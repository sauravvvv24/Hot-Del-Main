import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Get all categories with product counts
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (category, options = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.search) params.append('search', options.search);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.order) params.append('order', options.order);
    if (options.limit) params.append('limit', options.limit);

    const response = await axios.get(
      `${API_BASE_URL}/products/category/${encodeURIComponent(category)}?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// Get featured products
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/featured?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
}; 