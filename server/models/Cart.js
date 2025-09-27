import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
});

const cartSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  items: [cartItemSchema],
});

// ✅ Fix OverwriteModelError
const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export default Cart;
