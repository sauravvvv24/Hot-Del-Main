// routes/invoiceRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateInvoice } from '../controllers/invoiceController.js';

const router = express.Router();

// Generate and download invoice for an order
router.get('/download/:orderId', protect, generateInvoice);

export default router;
