import express from 'express';
import { 
  getAllProducts, 
  getProductsByCategory, 
  getCategories, 
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getProductById
} from '../controllers/productController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Product routes are working!' });
});

// Public routes
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);

// Protected routes (require authentication)
router.get('/mine', authMiddleware, getMyProducts);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

// Public route for getting single product (must be after /mine)
router.get('/:id', getProductById);

export default router;
