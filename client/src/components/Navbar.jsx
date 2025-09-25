import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  ChevronDown, 
  Menu, 
  X, 
  Package, 
  Truck, 
  Store,
  Settings,
  LogOut,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.jpeg';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Safety check for cartItems
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
            {user?.role === 'seller' ? (
              <div className="flex items-center cursor-default">
                <img
                  src={logo}
                  alt="Hot-Del Logo"
                  className="w-12 h-12 object-contain rounded-lg shadow-sm"
                />
                <span className="ml-3 text-xl font-bold text-gray-800 hidden sm:block">Hot-Del</span>
              </div>
            ) : (
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center hover:opacity-80 transition-opacity">
                <img
                  src={logo}
                  alt="Hot-Del Logo"
                  className="w-12 h-12 object-contain rounded-lg shadow-sm"
                />
                <span className="ml-3 text-xl font-bold text-gray-800 hidden sm:block">Hot-Del</span>
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            
            {/* Main Navigation Links */}
            <div className="flex items-center space-x-1 mr-6">
              {user?.role !== 'seller' && (
                <Link 
                  to="/products" 
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Products
                </Link>
              )}
              
              {user?.role === 'seller' && (
                <>
                  <Link 
                    to="/seller-dashboard" 
                    className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/my-products" 
                    className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    My Products
                  </Link>
                  <Link 
                    to="/seller/orders" 
                    className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Orders
                  </Link>
                  <Link 
                    to="/add-product" 
                    className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 font-medium transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Link>
                </>
              )}
            </div>

            {/* Hotel User Actions */}
            {user?.role === 'hotel' && (
              <div className="flex items-center space-x-1 mr-6">
                <Link 
                  to="/orders" 
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Orders
                </Link>
                <Link 
                  to="/track-orders" 
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Track
                </Link>
                <Link 
                  to="/wishlist" 
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 font-medium transition-all duration-200"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </Link>
              </div>
            )}

            {/* Cart for Hotel Users */}
            {user?.role === 'hotel' && (
              <div className="mr-6">
                <Link 
                  to="/cart" 
                  className="relative flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                  {safeCartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                      {safeCartItems.length}
                    </span>
                  )}
                </Link>
              </div>
            )}

            {/* User Profile or Auth Buttons */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={toggleDropdown} 
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden lg:block">{user.name || 'Profile'}</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                
                {dropdownOpen && (
                  <div ref={dropdownRef} className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                        {user.role}
                      </span>
                    </div>
                    <Link 
                      to={`/new-profile/${user.email}`} 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/hotel-signup" 
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Hotel Login
                </Link>
                <Link 
                  to="/seller-signup" 
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Seller Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-2">
            
            {/* User Info Section */}
            {user && (
              <div className="pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            {user?.role !== 'seller' && (
              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
              >
                <Package className="w-5 h-5 mr-3" />
                Products
              </Link>
            )}

            {user?.role === 'seller' && (
              <>
                <Link
                  to="/seller-dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                >
                  <Store className="w-5 h-5 mr-3" />
                  Dashboard
                </Link>
                <Link
                  to="/my-products"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                >
                  <Package className="w-5 h-5 mr-3" />
                  My Products
                </Link>
                <Link
                  to="/seller/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  Orders
                </Link>
                <Link
                  to="/add-product"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium transition-colors"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Add Product
                </Link>
              </>
            )}

            {user?.role === 'hotel' && (
              <>
                <Link
                  to="/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                >
                  <Package className="w-5 h-5 mr-3" />
                  My Orders
                </Link>
                <Link
                  to="/track-orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                >
                  <Truck className="w-5 h-5 mr-3" />
                  Track Orders
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium transition-colors"
                >
                  <Heart className="w-5 h-5 mr-3" />
                  Wishlist
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  Cart
                  {safeCartItems.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                      {safeCartItems.length}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
              >
                <Settings className="w-5 h-5 mr-3" />
                Admin Panel
              </Link>
            )}

            {/* Auth Section */}
            {!user ? (
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <Link
                  to="/hotel-signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-3 text-center text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  Hotel Login
                </Link>
                <Link
                  to="/seller-signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-3 text-center text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Seller Login
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100">
                <Link
                  to={`/new-profile/${user.email}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
