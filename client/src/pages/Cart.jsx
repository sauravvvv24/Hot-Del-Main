import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch cart items when component mounts
  useEffect(() => {
    const fetchCart = async () => {
      if (!user || !user._id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/cart/${user._id}`);
        console.log('Cart response:', response.data); // Debug log
        console.log('User ID being used:', user._id);
        
        // Handle different response structures
        if (response.data && response.data.items) {
          setCartItems(response.data.items);
        } else if (Array.isArray(response.data)) {
          setCartItems(response.data);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    // Find the current item to check stock
    const currentItem = cartItems.find(item => item.product?._id === productId);
    if (!currentItem) return;

    // Check if new quantity exceeds available stock
    const availableStock = currentItem.product?.stock || 0;
    if (newQuantity > availableStock) {
      toast.error(`Only ${availableStock} items available in stock`);
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/cart/${user._id}/${productId}`, {
        quantity: newQuantity
      });

      setCartItems(prev => 
        prev.map(item => 
          item.product?._id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await axios.delete(`http://localhost:3000/api/cart/${user._id}/${productId}`);
      setCartItems(prev => prev.filter(item => item.product?._id !== productId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.jpg';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/src/assets/')) {
      const assetName = imagePath.split('/').pop();
      return `/src/assets/${assetName}`;
    }
    
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    return imagePath;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/billing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to login to view your cart</p>
          <button
            onClick={() => navigate('/hotel-login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <BackButton className="mr-4" />
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-md">
              {cartItems.map((item, index) => (
                <div key={item.product?._id || index} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={getImageUrl(item.product?.image)}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.product?.name || 'Unknown Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.product?.brand || 'Unknown Brand'} • {item.product?.category || 'Unknown Category'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-lg font-bold text-green-600">
                          ₹{item.product?.price?.toFixed(2) || '0.00'} {item.product?.unit && `per ${item.product.unit}`}
                        </p>
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            (item.product?.stock || 0) > 10 
                              ? 'bg-green-100 text-green-800' 
                              : (item.product?.stock || 0) > 5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.product?.stock || 0} in stock
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium text-lg">{item.quantity || 0}</span>
                        <button
                          onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product?.stock || 0)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title={item.quantity >= (item.product?.stock || 0) ? 'Maximum stock reached' : 'Increase quantity'}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {item.quantity >= (item.product?.stock || 0) && (
                        <p className="text-xs text-red-600 font-medium">Max stock reached</p>
                      )}
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{((item.product?.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.product?._id)}
                        className="text-red-600 hover:text-red-800 text-sm mt-1 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">
                  Total Items: {cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{calculateTotal().toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
