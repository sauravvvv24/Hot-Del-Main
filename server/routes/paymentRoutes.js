// routes/paymentRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentStatus,
  handleWebhook
} from '../controllers/paymentController.js';
import {
  createMockOrder,
  processMockPayment,
  getMockPaymentStatus
} from '../controllers/mockPaymentController.js';

const router = express.Router();

// Real Razorpay routes (require authentication)
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/failure', protect, handlePaymentFailure);
router.get('/status/:orderId', protect, getPaymentStatus);

// Mock/Demo payment routes (for college demonstration)
router.post('/mock/create-order', protect, createMockOrder);
router.post('/mock/verify', protect, processMockPayment);
router.get('/mock/status/:orderId', protect, getMockPaymentStatus);

// Webhook route (no authentication required - verified by signature)
router.post('/webhook', handleWebhook);

export default router;
