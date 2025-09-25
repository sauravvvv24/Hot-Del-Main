// models/Wishlist.js
import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Ensure one wishlist per hotel
wishlistSchema.index({ hotelId: 1 }, { unique: true });

// Ensure no duplicate products in wishlist
wishlistSchema.index({ hotelId: 1, 'items.productId': 1 }, { unique: true, sparse: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
