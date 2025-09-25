import express from 'express';
import User from '../models/User.js';
import HotelModel from '../models/Hotel.js';
import { protect } from '../middleware/authMiddleware.js';
import { updateUser } from '../controllers/userController.js';

const router = express.Router();

// 🔓 GET all users (could be restricted in future to admin)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// 🔒 GET logged-in user's profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // fixed: use req.user.id
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// 🔓 GET user by email (checks both User and Hotel collections)
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // First check User collection
    let user = await User.findOne({ email }).select('-password');
    
    // If not found in User collection, check Hotel collection
    if (!user) {
      const hotel = await HotelModel.findOne({ email }).select('-password');
      if (hotel) {
        // Transform hotel data to match user format
        user = {
          _id: hotel._id,
          name: hotel.name,
          email: hotel.email,
          role: 'hotel',
          phone: hotel.phone,
          address: hotel.address,
          type: hotel.type,
          createdAt: hotel.createdAt,
          updatedAt: hotel.updatedAt
        };
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// 🔒 PUT update user by ID
router.put('/:id', protect, updateUser);

export default router;
