// pages/Wishlist.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWishlist, removeFromWishlist, clearWishlist } from '../api/wishlist';
import { addToCart } from '../api/cart';
import { Heart, ShoppingCart, Trash2, Package, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Wishlist = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getWishlist(token);
      if (response.success) {
        setWishlist(response.wishlist);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      fetchWishlist();
    }
  }, [user, token, fetchWishlist]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setActionLoading(prev => ({ ...prev, [productId]: 'removing' }));
      const response = await removeFromWishlist(productId, token);
      if (response.success) {
        setWishlist(response.wishlist);
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: null }));
    }
  };

  const handleAddToCart = async (product) => {
    try {
      setActionLoading(prev => ({ ...prev, [product._id]: 'adding' }));
      const response = await addToCart(product._id, 1, token);
      if (response.success) {
        toast.success('Added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Product already in cart');
      } else {
        toast.error('Failed to add to cart');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [product._id]: null }));
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, clear: true }));
      const response = await clearWishlist(token);
      if (response.success) {
        setWishlist(response.wishlist);
        toast.success('Wishlist cleared');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    } finally {
      setActionLoading(prev => ({ ...prev, clear: false }));
    }
  };

  // Function to get proper image URL (same as ProductCard)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.jpg';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it starts with /uploads/, it's a server upload
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:3000${imagePath}`;
    }
    
    // If it starts with /src/assets/, convert to proper path for client
    if (imagePath.startsWith('/src/assets/')) {
      const assetName = imagePath.split('/').pop();
      return `/src/assets/${assetName}`;
    }
    
    // If it's a relative path starting with /, assume it's in the assets folder
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    return imagePath;
  };

  if (!user || user.role !== 'hotel') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Wishlist is only available for hotel users.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Login as Hotel
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <BackButton 
              onClick={() => navigate(-1)}
              className="mr-4"
            />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-1">
                {wishlist?.itemCount || 0} {wishlist?.itemCount === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>

          {wishlist?.items?.length > 0 && (
            <button
              onClick={handleClearWishlist}
              disabled={actionLoading.clear}
              className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {actionLoading.clear ? 'Clearing...' : 'Clear All'}
            </button>
          )}
        </div>

        {/* Wishlist Content */}
        {!wishlist?.items?.length ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">
                Start adding products you love to your wishlist by clicking the heart icon on product cards.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                Browse Products
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.items.map((item) => {
              const product = item.productId;
              if (!product) return null;

              return (
                <div key={item._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100">
                    {product.image ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      disabled={actionLoading[product._id] === 'removing'}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                    </button>

                    {/* Stock Status */}
                    {product.stock <= 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {product.brand && (
                      <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                    )}

                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {product.rating || '4.5'} ({product.reviews || '0'} reviews)
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-green-600">
                          ₹{product.price?.toFixed(2)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        Stock: {product.stock}
                      </span>
                    </div>

                    {/* Seller Info */}
                    {product.seller && (
                      <p className="text-xs text-gray-500 mb-3">
                        Sold by: {product.seller.businessName || product.seller.name}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0 || actionLoading[product._id] === 'adding'}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {actionLoading[product._id] === 'adding' ? 'Adding...' : 'Add to Cart'}
                      </button>
                      
                      <button
                        onClick={() => navigate(`/products/${product._id}`)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        View
                      </button>
                    </div>

                    {/* Added Date */}
                    <p className="text-xs text-gray-400 mt-2">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
