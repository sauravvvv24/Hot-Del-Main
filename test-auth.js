// Test authentication with a sample token
import axios from 'axios';

const testAuth = async () => {
  try {
    // First, let's test without token
    console.log('Testing without token...');
    const response1 = await axios.get('http://localhost:3000/api/products/mine');
    console.log('Response without token:', response1.data);
  } catch (error) {
    console.log('Expected 401 error without token:', error.response?.status, error.response?.data);
  }

  // Test with a dummy token
  try {
    console.log('Testing with dummy token...');
    const response2 = await axios.get('http://localhost:3000/api/products/mine', {
      headers: { Authorization: 'Bearer dummy-token' }
    });
    console.log('Response with dummy token:', response2.data);
  } catch (error) {
    console.log('Expected 401 error with dummy token:', error.response?.status, error.response?.data);
  }
};

testAuth();
