// components/WishlistButton.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addToWishlist, removeFromWishlist, checkWishlistStatus } from '../api/wishlist';
import { toast } from 'react-hot-toast';

const WishlistButton = ({ productId, className = "", size = "md" }) => {
  const { user, token } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Size variants
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const buttonSizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3"
  };

  const checkStatus = useCallback(async () => {
    try {
      setChecking(true);
      const response = await checkWishlistStatus(productId, token);
      if (response.success) {
        setIsInWishlist(response.isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    } finally {
      setChecking(false);
    }
  }, [productId, token]);

  useEffect(() => {
    if (user && token && user.role === 'hotel' && productId) {
      checkStatus();
    } else {
      setChecking(false);
    }
  }, [user, token, productId, checkStatus]);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || user.role !== 'hotel') {
      toast.error('Please login as a hotel to use wishlist');
      return;
    }

    if (!token) {
      toast.error('Please login to use wishlist');
      return;
    }

    try {
      setLoading(true);
      
      if (isInWishlist) {
        const response = await removeFromWishlist(productId, token);
        if (response.success) {
          setIsInWishlist(false);
          toast.success('Removed from wishlist');
        }
      } else {
        const response = await addToWishlist(productId, token);
        if (response.success) {
          setIsInWishlist(true);
          toast.success('Added to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Failed to update wishlist');
      } else {
        toast.error('Failed to update wishlist');
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render for non-hotel users
  if (!user || user.role !== 'hotel') {
    return null;
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading || checking}
      className={`
        ${buttonSizeClasses[size]}
        bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200
        ${isInWishlist 
          ? 'hover:bg-red-50 text-red-500' 
          : 'hover:bg-gray-50 text-gray-400 hover:text-red-400'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading || checking ? (
        <div className={`${sizeClasses[size]} animate-spin border-2 border-gray-300 border-t-red-500 rounded-full`} />
      ) : (
        <Heart 
          className={`${sizeClasses[size]} transition-colors ${
            isInWishlist ? 'fill-current' : ''
          }`} 
        />
      )}
    </button>
  );
};

export default WishlistButton;
