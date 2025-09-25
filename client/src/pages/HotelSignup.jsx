// src/pages/HotelSignup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import OTPVerification from '../components/OTPVerification';
import { 
  Building2, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  CheckCircle, 
  Star,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';

const HotelSignup = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    phone: '',
    address: '',
    hotelType: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Hotel name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email address';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Send OTP for email verification
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3000/api/otp/send-otp', {
        email: form.email,
        userType: 'hotel'
      });
      
      toast.success('Verification code sent to your email!');
      setShowOTPVerification(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Failed to send OTP: ${msg}`);
      if (msg.includes('email')) {
        setErrors(prev => ({ ...prev, email: msg }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification success
  const handleOTPVerified = () => {
    setShowOTPVerification(false);
    handleFinalSignup();
  };

  // Handle back from OTP verification
  const handleBackFromOTP = () => {
    setShowOTPVerification(false);
  };

  // Final signup after OTP verification
  const handleFinalSignup = async () => {
    setIsLoading(true);
    try {
      const payload = { 
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        type: form.hotelType
      };
      await axios.post('http://localhost:3000/api/auth/hotel-register', payload);
      toast.success('Hotel registration successful! Please log in.');
      navigate('/hotel-login');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Signup failed: ${msg}`);
      if (msg.includes('email')) {
        setErrors(prev => ({ ...prev, email: msg }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show OTP verification screen if needed
  if (showOTPVerification) {
    return (
      <OTPVerification
        email={form.email}
        userType="hotel"
        onVerified={handleOTPVerified}
        onBack={handleBackFromOTP}
        title="Verify Your Hotel Email"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      
      <div className="relative flex items-center justify-center px-4 py-8 min-h-screen">
        <div className="w-full max-w-6xl bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left: Form Section */}
            <div className="p-8 lg:p-12">
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
                  Join Our Hotel Network
                </h1>
                <p className="text-gray-600 text-lg">
                  Connect with premium suppliers and streamline your procurement
                </p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-6">
                {/* Hotel Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700">
                    <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                    Hotel Name
                  </label>
                  {errors.name && <p className="text-sm text-red-500 flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>{errors.name}</p>}
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Hotel Royal View"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      errors.name 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-4 focus:outline-none bg-white/50 backdrop-blur-sm`}
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700">
                    <Mail className="w-4 h-4 mr-2 text-blue-600" />
                    Email Address
                  </label>
                  {errors.email && <p className="text-sm text-red-500 flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>{errors.email}</p>}
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="hotel@example.com"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-4 focus:outline-none bg-white/50 backdrop-blur-sm`}
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-700">
                    <Lock className="w-4 h-4 mr-2 text-blue-600" />
                    Password
                  </label>
                  {errors.password && <p className="text-sm text-red-500 flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>{errors.password}</p>}
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-4 focus:outline-none bg-white/50 backdrop-blur-sm`}
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700">
                    <Phone className="w-4 h-4 mr-2 text-blue-600" />
                    Phone Number
                  </label>
                  {errors.phone && <p className="text-sm text-red-500 flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>{errors.phone}</p>}
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="+91 9876543210"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      errors.phone 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-4 focus:outline-none bg-white/50 backdrop-blur-sm`}
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label htmlFor="address" className="flex items-center text-sm font-semibold text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    Hotel Address
                  </label>
                  {errors.address && <p className="text-sm text-red-500 flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>{errors.address}</p>}
                  <textarea
                    rows={3}
                    id="address"
                    name="address"
                    placeholder="123 Marine Drive, Mumbai, Maharashtra"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 resize-none ${
                      errors.address 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-4 focus:outline-none bg-white/50 backdrop-blur-sm`}
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>

                {/* Hotel Type */}
                <div className="space-y-2">
                  <label htmlFor="hotelType" className="flex items-center text-sm font-semibold text-gray-700">
                    <Award className="w-4 h-4 mr-2 text-blue-600" />
                    Hotel Type
                  </label>
                  <select
                    id="hotelType"
                    name="hotelType"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none bg-white/50 backdrop-blur-sm transition-all duration-300"
                    value={form.hotelType}
                    onChange={handleChange}
                  >
                    <option value="">Select Hotel Type</option>
                    <option value="boutique">Boutique Hotel</option>
                    <option value="luxury">Luxury Hotel</option>
                    <option value="resort">Resort</option>
                    <option value="business">Business Hotel</option>
                    <option value="budget">Budget Hotel</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <input 
                    id="terms" 
                    name="terms" 
                    type="checkbox" 
                    required 
                    className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800 font-medium underline decoration-blue-200 hover:decoration-blue-400 transition-colors">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800 font-medium underline decoration-blue-200 hover:decoration-blue-400 transition-colors">
                      Privacy Policy
                    </a>
                  </label>
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
                      Creating Account...
                    </span>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>

                <p className="text-center text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    to="/hotel-login" 
                    className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </form>
            </div>

            {/* Right: Benefits Section */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 lg:p-12 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center space-y-8">
                {/* Header */}
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    Why Choose Hot-Del?
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Join 500+ hotels already transforming their procurement
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="bg-green-400 p-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">200+ Verified Suppliers</h3>
                      <p className="text-blue-100 text-sm">Premium dairy & frozen food vendors</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="bg-yellow-400 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Save 15+ Hours Weekly</h3>
                      <p className="text-blue-100 text-sm">Automated procurement process</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="bg-purple-400 p-2 rounded-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Quality Guaranteed</h3>
                      <p className="text-blue-100 text-sm">On-time cold delivery & freshness</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="bg-indigo-400 p-2 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Dedicated Support</h3>
                      <p className="text-blue-100 text-sm">Personal account manager</p>
                    </div>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="bg-gradient-to-r from-white/20 to-white/10 p-6 rounded-2xl border border-white/30 backdrop-blur-sm">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg font-medium mb-4">
                    "Hot-Del reduced our procurement costs by 18% and eliminated food spoilage completely. Game changer!"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">PS</span>
                    </div>
                    <div>
                      <p className="font-semibold">Priya Sharma</p>
                      <p className="text-blue-200 text-sm">Procurement Head, Grand Palace Hotel</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">500+</div>
                    <div className="text-blue-200 text-sm">Hotels Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">18%</div>
                    <div className="text-blue-200 text-sm">Cost Savings</div>
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

export default HotelSignup;
