// pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, Mail, Phone, MapPin } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { addToCart } from '../api/cart';
import { toast } from 'react-hot-toast';
import BackButton from '../components/BackButton';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/products/${productId}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    // Allow all authenticated users to add to cart for now
    // if (user.role !== 'hotel') {
    //   toast.error('Only hotel users can add items to cart');
    //   return;
    // }

    try {
      await addToCart(user._id, product._id);
      toast.success('Added to cart!');
      // Force refresh the page to update cart count
      window.location.reload();
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Error adding to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to purchase products');
      return;
    }

    // Allow all authenticated users to purchase for now
    // if (user.role !== 'hotel') {
    //   toast.error('Only hotel users can purchase products');
    //   return;
    // }

    try {
      await addToCart(user._id, product._id);
      toast.success('Redirecting to checkout...');
      navigate('/billing');
    } catch (err) {
      console.error('Error buying product:', err);
      toast.error('Error processing purchase');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <BackButton 
          onClick={() => navigate(-1)}
          className="mb-6"
        />

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                {product.category && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-3">
                    {product.category}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {product.brand && (
                  <p className="text-lg text-gray-600 mb-4">Brand: {product.brand}</p>
                )}
              </div>

              {/* Price and Stock */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-green-600">
                    ₹{product.price?.toFixed(2) || '0.00'}
                  </span>
                  {product.unit && (
                    <span className="text-gray-500">per {product.unit}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                  {product.featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Seller Information */}
              {product.seller && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-600 p-2 rounded-lg mr-3">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Seller Information</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {product.seller.businessName || product.seller.name}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {product.seller.email && (
                            <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                              <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <Mail className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                                <p className="text-sm font-medium text-gray-900">{product.seller.email}</p>
                              </div>
                            </div>
                          )}
                          {product.seller.phone && (
                            <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                              <div className="bg-green-100 p-2 rounded-full mr-3">
                                <Phone className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                                <p className="text-sm font-medium text-gray-900">{product.seller.phone}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {product.seller.address && (
                          <div className="flex items-start text-gray-600 bg-gray-50 rounded-lg p-3 mt-3">
                            <div className="bg-red-100 p-2 rounded-full mr-3 mt-0.5">
                              <MapPin className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Address</p>
                              <p className="text-sm font-medium text-gray-900">{product.seller.address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Seller ID</p>
                          <p className="text-sm font-mono text-blue-800 break-all">{product.seller._id.slice(-8)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons - Show for all authenticated users */}
              {user && (
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg font-medium transition-colors ${
                      product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                      product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                  </button>
                </div>
              )}


              {/* Login prompt for non-hotel users */}
              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-center">
                    Please <button onClick={() => navigate('/hotel-login')} className="underline font-medium">login</button> to purchase this product
                  </p>
                </div>
              )}

              {user && user.role !== 'hotel' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-center">
                    Note: You are logged in as {user.role}. Only hotel users can purchase products.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
