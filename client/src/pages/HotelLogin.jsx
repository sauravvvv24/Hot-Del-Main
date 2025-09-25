// src/pages/HotelLogin.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Building2, 
  Mail, 
  Lock, 
  CheckCircle, 
  Star,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Award,
  ArrowRight
} from 'lucide-react';

const HotelLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const res = await axios.post('http://localhost:3000/api/auth/hotel-login', {
        email,
        password,
      });
      const { token, user } = res.data;
      login(user, token);
      toast.success('Welcome back! Login successful.');
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.toLowerCase().includes('password')) {
        setErrors({ password: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      
      <div className="relative flex items-center justify-center px-4 py-8 min-h-screen">
        <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left: Login Form */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              {/* Header */}
              <div className="mb-8 text-center">
                <Link to="/" className="inline-flex items-center group mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-xl mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Hot-Del
                  </span>
                </Link>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600 text-lg">
                  Sign in to your hotel account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700">
                    <Mail className="w-4 h-4 mr-2 text-blue-600" />
                    Email Address
                  </label>
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.email}
                    </p>
                  )}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="hotel@example.com"
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-4 focus:outline-none bg-white/50 backdrop-blur-sm`}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-700">
                    <Lock className="w-4 h-4 mr-2 text-blue-600" />
                    Password
                  </label>
                  {errors.password && (
                    <p className="text-sm text-red-500 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.password}
                    </p>
                  )}
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    placeholder="••••••••"
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-4 focus:outline-none bg-white/50 backdrop-blur-sm`}
                  />
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ${
                    isLoading ? 'opacity-70 cursor-not-allowed transform-none' : 'hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      Signing In...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </span>
                  )}
                </button>

                {/* Sign Up Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link 
                      to="/hotel-signup" 
                      className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
                    >
                      Create one here
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Right: Welcome Section */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 lg:p-12 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center space-y-8">
                {/* Header */}
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    Ready to Streamline Your Procurement?
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Access your dashboard and manage orders efficiently
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">500+</div>
                    <div className="text-blue-200 text-sm">Hotels Trust Us</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="text-2xl font-bold text-green-400 mb-1">24/7</div>
                    <div className="text-blue-200 text-sm">Support Available</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="bg-green-400 p-2 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Instant access to 200+ suppliers</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="bg-blue-400 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Real-time order tracking</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="bg-purple-400 p-2 rounded-lg">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Quality guaranteed delivery</span>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="bg-gradient-to-r from-white/20 to-white/10 p-6 rounded-2xl border border-white/30 backdrop-blur-sm">
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-sm font-medium mb-3">
                    "Hot-Del transformed our procurement process. Highly recommended!"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">RK</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Raj Kumar</p>
                      <p className="text-blue-200 text-xs">Manager, Luxury Inn</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelLogin;
