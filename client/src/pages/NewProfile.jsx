import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Shield, Calendar, ArrowLeft, Edit3, Save, X, Check } from 'lucide-react';

const NewProfile = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth(); // Get token from AuthContext
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessName: '',
    type: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!email) return;
      try {
        const response = await axios.get(`http://localhost:3000/api/users/${email}`);
        setUserInfo(response.data);
        setEditForm({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          businessName: response.data.businessName || '',
          type: response.data.type || ''
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load user information');
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [email]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to original values when canceling
      setEditForm({
        name: userInfo.name || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        address: userInfo.address || '',
        businessName: userInfo.businessName || '',
        type: userInfo.type || ''
      });
    }
    setIsEditing(!isEditing);
    setUpdateSuccess(false);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    setUpdateLoading(true);
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      await axios.put(`http://localhost:3000/api/users/${userInfo._id}`, editForm, config);
      
      // Update userInfo with the new data immediately for real-time UI update
      const updatedUserInfo = {
        ...userInfo,
        ...editForm,
        updatedAt: new Date().toISOString() // Update the timestamp
      };
      
      setUserInfo(updatedUserInfo);
      setIsEditing(false);
      setError(null); // Clear any existing errors
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to update user information. Please try again.');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name?.split(' ').map(word => word[0]).join('').toUpperCase() || 'U';
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'hotel': return 'bg-blue-100 text-blue-800';
      case 'seller': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          {/* Success Message */}
          {updateSuccess && (
            <div className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg animate-pulse">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Profile updated successfully!</span>
            </div>
          )}
        </div>

        {/* Main Profile Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-8">
          {/* Header Section */}
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 h-40"></div>
            <div className="absolute inset-x-0 bottom-0 transform translate-y-1/2">
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">{getInitials(userInfo?.name)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="pt-20 pb-8 px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{userInfo?.name}</h1>
              <div className="flex items-center justify-center mb-4">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getRoleColor(userInfo?.role)}`}>
                  <Shield className="w-4 h-4 mr-2" />
                  {userInfo?.role?.charAt(0).toUpperCase() + userInfo?.role?.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                Member since {formatDate(userInfo?.createdAt)}
              </div>
            </div>

            {/* Edit Toggle Button */}
            <div className="flex justify-center mb-8">
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={handleSave}
                    disabled={updateLoading}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="w-5 h-5 mr-2" />
                    )}
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-lg"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information Card */}
          <div className="bg-white shadow-lg rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Mail className="w-6 h-6 mr-3 text-blue-600" />
              Contact Information
            </h2>
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900 font-medium">{userInfo?.name || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Business Name Field - Only for sellers */}
              {userInfo?.role === 'seller' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your business name"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900 font-medium">{userInfo?.businessName || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email address"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900 font-medium">{userInfo?.email || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900 font-medium">{userInfo?.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                {isEditing ? (
                  <textarea
                    value={editForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Enter your address"
                  />
                ) : (
                  <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <span className="text-gray-900 font-medium whitespace-pre-line">{userInfo?.address || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Hotel Type Field - Only for hotels */}
              {userInfo?.role === 'hotel' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hotel Type</label>
                  {isEditing ? (
                    <select
                      value={editForm.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select hotel type</option>
                      <option value="luxury">Luxury Hotel</option>
                      <option value="business">Business Hotel</option>
                      <option value="resort">Resort</option>
                      <option value="boutique">Boutique Hotel</option>
                      <option value="budget">Budget Hotel</option>
                      <option value="motel">Motel</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900 font-medium capitalize">{userInfo?.type || 'Not specified'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Account Information Card */}
          <div className="bg-white shadow-lg rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-purple-600" />
              Account Information
            </h2>
            <div className="space-y-6">
              {userInfo?.type && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-gray-900 font-medium capitalize">{userInfo.type}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Account ID</label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900 font-mono text-sm">{userInfo?._id}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Updated</label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900 font-medium">{formatDate(userInfo?.updatedAt)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Status</label>
                <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-green-800 font-semibold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProfile;