// routes/orderRoutes.js
import express from 'express';
import { placeOrder, getOrdersByHotel, getOrdersBySeller, updateOrderStatus, getOrderById } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/place', placeOrder);              // POST: Place an order
router.get('/seller', protect, getOrdersBySeller); // GET: Seller's orders
router.put('/:orderId/status', protect, updateOrderStatus); // PUT: Update order status
router.get('/single/:orderId', protect, getOrderById); // GET: Single order by ID
router.get('/:hotelId', getOrdersByHotel);      // GET: Hotel's past orders

export default router;
