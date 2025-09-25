// routes/authRoutes.js
import express from 'express';
import { hotelRegister, hotelLogin, sellerRegister, sellerLogin } from '../controllers/authController.js';

const router = express.Router();

// Hotel routes
router.post('/hotel-register', hotelRegister);
router.post('/hotel-login', hotelLogin);

// Seller routes
router.post('/seller-register', sellerRegister);
router.post('/seller-login', sellerLogin);

export default router;
