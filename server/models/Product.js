import mongoose from 'mongoose';

// Predefined categories for food items - Simplified
export const PRODUCT_CATEGORIES = [
  'Dairy Products',
  'Fruits',
  'Vegetables',
  'Frozen Products'
];

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: PRODUCT_CATEGORIES,
    default: 'Dairy Products'
  },
  stock: { type: Number, default: 0 },
  unit: { type: String, default: '1 piece' },
  brand: { type: String, default: 'Generic' },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  outOfStock: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

// Index for better search performance
productSchema.index({ category: 1, name: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
