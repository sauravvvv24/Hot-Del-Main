// routes/refundRoutes.js
import express from 'express';
import {
  cancelOrderByHotel,
  cancelOrderBySeller,
  getRefundPolicy,
  checkCancellationEligibility
} from '../controllers/refundController.js';
import { testEmail } from '../controllers/testEmailController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get refund policy (public route)
router.get('/policy', getRefundPolicy);

// Check if order can be cancelled (protected route)
router.get('/check/:orderId', authMiddleware, checkCancellationEligibility);

// Cancel order by hotel user (protected route)
router.post('/cancel/hotel/:orderId', authMiddleware, cancelOrderByHotel);

// Cancel order by seller (protected route)
router.post('/cancel/seller/:orderId', authMiddleware, cancelOrderBySeller);

// Test email functionality (for debugging)
router.post('/test-email', testEmail);

export default router;
