import User from '../models/User.js';
import HotelModel from '../models/Hotel.js';

export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, businessName, type } = req.body;
    
    // First try to find in User collection
    let user = await User.findById(id);
    let isHotel = false;
    
    // If not found in User collection, try Hotel collection
    if (!user) {
      user = await HotelModel.findById(id);
      isHotel = true;
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update common fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    
    // Update specific fields based on user type
    if (isHotel) {
      // Hotel-specific fields
      if (type !== undefined) user.type = type;
    } else {
      // User-specific fields (sellers, etc.)
      if (businessName !== undefined) user.businessName = businessName;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
