import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      // First try to login as a seller
      let res = await axios.post('http://localhost:3000/api/auth/seller-login', {
        email: form.email,
        password: form.password,
      });
      const userData = res.data.user;
      const token = res.data.token;
      login(userData, token);
      const storage = form.rememberMe ? localStorage : sessionStorage;
      storage.setItem('userInfo', JSON.stringify(userData));
      storage.setItem('token', token);
      const role = userData.role;
      if (role === 'admin') navigate('/admin-panel');
      else if (role === 'seller') navigate('/seller-dashboard');
      else navigate('/products');
    } catch (sellerError) {
      // If seller login fails, try hotel login
      try {
        const res = await axios.post('http://localhost:3000/api/auth/hotel-login', {
          email: form.email,
          password: form.password,
        });
        const hotelData = res.data.hotel;
        const token = res.data.token;
        login(hotelData, token);
        const storage = form.rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', token);
        navigate('/hotel-dashboard');
      } catch (hotelError) {
        const msg = hotelError.response?.data?.message || 'Login failed. Please check your credentials.';
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roleBenefits = [
    'Access to 500+ hotels and verified vendors',
    'Real-time order tracking with temperature monitoring',
    'Secure payments and weekly payouts',
    'Dedicated account manager for premium users',
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center">
            <div className="bg-blue-600 text-white font-bold text-lg px-2 py-1 rounded-md mr-2">HD</div>
            <span className="text-2xl font-bold text-blue-700">Hot-Del</span>
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Sign in to Your Account</h1>
          <p className="mt-2 text-gray-600 max-w-lg mx-auto">
            Streamline your hotel procurement or grow your vendor business
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:grid md:grid-cols-2">
            {/* Form Section */}
            <div className="p-8 sm:p-10">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="contact@yourbusiness.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">Forgot password?</Link>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : 'Sign in to Your Account'}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {/* Social login buttons here */}
                </div>
              </div>

              <div className="mt-8 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">Sign up</Link>
                <br />
                Are you a vendor?{' '}
                <Link to="/seller-signup" className="font-medium text-green-600 hover:text-green-500">Create seller account</Link>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-700 p-8 sm:p-10 text-white flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4">Why Join Hot-Del?</h2>
              <ul className="space-y-4">
                {roleBenefits.map((b, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="h-5 w-5 text-green-300 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="font-medium">{b}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
