// controllers/wishlistController.js
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const hotelId = req.user._id;
    
    let wishlist = await Wishlist.findOne({ hotelId })
      .populate({
        path: 'items.productId',
        populate: {
          path: 'seller',
          select: 'name businessName email'
        }
      });
    
    if (!wishlist) {
      wishlist = new Wishlist({ hotelId, items: [] });
      await wishlist.save();
    }
    
    // Filter out any items with null productId (deleted products)
    const validItems = wishlist.items.filter(item => item.productId);
    
    if (validItems.length !== wishlist.items.length) {
      wishlist.items = validItems;
      await wishlist.save();
    }
    
    res.json({
      success: true,
      wishlist: {
        _id: wishlist._id,
        hotelId: wishlist.hotelId,
        items: validItems,
        itemCount: validItems.length
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

// Add item to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const hotelId = req.user._id;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ hotelId });
    if (!wishlist) {
      wishlist = new Wishlist({ hotelId, items: [] });
    }
    
    // Check if product already in wishlist
    const existingItem = wishlist.items.find(
      item => item.productId.toString() === productId
    );
    
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }
    
    // Add product to wishlist
    wishlist.items.push({
      productId,
      addedAt: new Date()
    });
    
    await wishlist.save();
    
    // Populate the newly added item
    await wishlist.populate({
      path: 'items.productId',
      populate: {
        path: 'seller',
        select: 'name businessName email'
      }
    });
    
    res.json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: {
        _id: wishlist._id,
        hotelId: wishlist.hotelId,
        items: wishlist.items,
        itemCount: wishlist.items.length
      }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      error: error.message
    });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const hotelId = req.user._id;
    
    const wishlist = await Wishlist.findOne({ hotelId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    // Remove product from wishlist
    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
      item => item.productId.toString() !== productId
    );
    
    if (wishlist.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }
    
    await wishlist.save();
    
    // Populate remaining items
    await wishlist.populate({
      path: 'items.productId',
      populate: {
        path: 'seller',
        select: 'name businessName email'
      }
    });
    
    res.json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: {
        _id: wishlist._id,
        hotelId: wishlist.hotelId,
        items: wishlist.items,
        itemCount: wishlist.items.length
      }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      error: error.message
    });
  }
};

// Clear entire wishlist
export const clearWishlist = async (req, res) => {
  try {
    const hotelId = req.user._id;
    
    const wishlist = await Wishlist.findOne({ hotelId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    wishlist.items = [];
    await wishlist.save();
    
    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      wishlist: {
        _id: wishlist._id,
        hotelId: wishlist.hotelId,
        items: [],
        itemCount: 0
      }
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message
    });
  }
};

// Check if product is in wishlist
export const checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const hotelId = req.user._id;
    
    const wishlist = await Wishlist.findOne({ hotelId });
    
    const isInWishlist = wishlist ? 
      wishlist.items.some(item => item.productId.toString() === productId) : 
      false;
    
    res.json({
      success: true,
      isInWishlist,
      itemCount: wishlist ? wishlist.items.length : 0
    });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status',
      error: error.message
    });
  }
};
