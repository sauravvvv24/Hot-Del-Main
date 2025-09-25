// Test seller authentication flow
import axios from 'axios';

const testSellerAuth = async () => {
  try {
    console.log('Testing seller authentication flow...');
    
    // Test seller registration with fresh credentials
    const timestamp = Date.now();
    const registerData = {
      name: 'Test Seller',
      email: `testseller${timestamp}@example.com`,
      password: 'testpassword123'
    };
    
    console.log('1. Attempting seller registration...');
    let loginEmail = registerData.email;
    let loginPassword = registerData.password;
    
    try {
      const registerResponse = await axios.post('http://localhost:3000/api/auth/seller-register', registerData);
      console.log('Registration successful:', registerResponse.data);
    } catch (regError) {
      console.error('Registration failed:', regError.response?.data);
      // Try with existing test credentials
      loginEmail = 'testseller@example.com';
      loginPassword = 'testpassword123';
    }
    
    // Test seller login
    console.log('2. Attempting seller login...');
    const loginData = {
      email: loginEmail,
      password: loginPassword
    };
    
    const loginResponse = await axios.post('http://localhost:3000/api/auth/seller-login', loginData);
    console.log('Login successful:', loginResponse.data);
    
    const token = loginResponse.data.token;
    console.log('Token received:', token.substring(0, 50) + '...');
    
    // Test fetching products with the token
    console.log('3. Testing product fetch with valid token...');
    const productsResponse = await axios.get('http://localhost:3000/api/products/mine', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Products fetch successful:', productsResponse.data);
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

testSellerAuth();
