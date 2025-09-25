import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart } from '../api/cart';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_COLORS } from '../constants/categories.js';
import { toast } from 'react-hot-toast';
import WishlistButton from './WishlistButton';

const ProductCard = ({ product, showEditButton = false }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    // Check if product is in stock
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      await addToCart(user._id, product._id);
      toast.success('Added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err.response?.data?.message?.includes('stock')) {
        toast.error('Not enough stock available');
      } else {
        toast.error('Error adding to cart');
      }
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !token) {
      toast.error('Please login to purchase products');
      return;
    }

    // Check if product is in stock
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      // Add to cart first, then navigate to billing
      await addToCart(user._id, product._id);
      toast.success('Redirecting to checkout...');
      // Navigate directly to billing page
      navigate('/billing');
    } catch (err) {
      console.error('Error buying product:', err);
      if (err.response?.data?.message?.includes('stock')) {
        toast.error('Not enough stock available');
      } else {
        toast.error('Error processing purchase');
      }
    }
  };

  const handleEditProduct = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-product/${product._id}`);
  };

  const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800';
  };

  // Function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.jpg';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it starts with /src/assets/, convert to proper path for client
    if (imagePath.startsWith('/src/assets/')) {
      // For client-side, we need to handle this differently
      const assetName = imagePath.split('/').pop();
      return `/src/assets/${assetName}`;
    }
    
    // If it's a relative path starting with /, assume it's in the assets folder
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    return imagePath;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg border border-gray-200/60 hover:border-gray-300/80 transition-all duration-300 overflow-hidden group max-w-sm w-full mx-auto backdrop-blur-sm hover:-translate-y-1">
      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative bg-gradient-to-br from-gray-50 to-white">
          <img 
            src={getImageUrl(product.image)} 
            alt={product.name} 
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && (
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                ⭐ Featured
              </div>
            )}
            {product.stock === 0 && (
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                Out of Stock
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <div className="absolute top-2 right-2">
            <WishlistButton productId={product._id} size="md" />
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        {/* Category Badge */}
        {product.category && (
          <div className="mb-3">
            <span className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wide ${getCategoryColor(product.category)}`}>
              {product.category}
            </span>
          </div>
        )}

        {/* Product Name */}
        <Link to={`/products/${product._id}`}>
          <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-gray-600 font-medium mb-3 flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            {product.brand}
          </p>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price and Stock */}
        <div className="mb-6 border-t border-gray-100 pt-4">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-2xl font-bold text-gray-900">
              ₹{product.price?.toFixed(2) || '0.00'}
            </span>
            {product.unit && (
              <span className="text-sm text-gray-500 font-medium">
                per {product.unit}
              </span>
            )}
          </div>
          {product.stock !== undefined && (
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide ${
                product.stock === 0 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : product.stock <= 5
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {product.stock === 0 
                  ? 'Sold Out' 
                  : product.stock <= 5 
                  ? `Only ${product.stock} Left!` 
                  : `${product.stock} Available`
                }
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons - Professional Layout */}
        <div className="flex flex-col space-y-2">
          {showEditButton ? (
            <button
              onClick={handleEditProduct}
              className="w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              ✏️ Edit Product
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  product.stock === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-sm'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg focus:ring-blue-500'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  product.stock === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-sm'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-md hover:shadow-lg focus:ring-emerald-500'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {product.stock === 0 ? 'Unavailable' : 'Buy Now'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;