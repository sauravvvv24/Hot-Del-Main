// routes/cartRoutes.js
import express from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from '../controllers/cartController.js';

const router = express.Router();

router.post('/add', addToCart);
router.get('/:hotelId', getCart);
router.delete('/remove', removeFromCart);
// Additional routes for frontend compatibility
router.put('/:userId/:productId', async (req, res) => {
  // Update quantity route - redirect to existing logic
  const { quantity } = req.body;
  req.body = { hotelId: req.params.userId, productId: req.params.productId, quantity };
  return updateCartItem(req, res);
});
router.delete('/:userId/:productId', async (req, res) => {
  // Remove item route - redirect to existing logic
  req.body = { hotelId: req.params.userId, productId: req.params.productId };
  return removeFromCart(req, res);
});

export default router;
