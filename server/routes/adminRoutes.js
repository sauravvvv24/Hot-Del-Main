import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ✅ Admin-only route
router.get('/dashboard', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  res.json({ message: `Welcome Admin, ${req.user.name}` });
});

export default router;
