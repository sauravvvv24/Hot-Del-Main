// Script to clear existing cart data and test functionality
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hot-del', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const cartSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
  }],
});

const Cart = mongoose.model('Cart', cartSchema);

async function clearInvalidCarts() {
  try {
    console.log('Clearing all existing cart data...');
    await Cart.deleteMany({});
    console.log('✅ All cart data cleared successfully');
    
    console.log('Cart cleanup completed. You can now test adding products to cart.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing cart data:', error);
    process.exit(1);
  }
}

clearInvalidCarts();
