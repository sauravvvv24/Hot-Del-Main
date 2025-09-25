// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import HotelModel from '../models/Hotel.js';
import User from '../models/User.js';
import { checkEmailVerification } from './otpController.js';
import { sendWelcomeEmail } from '../config/emailConfig.js';
import OTP from '../models/OTP.js';

const JWT_SECRET = process.env.JWT_SECRET || '9612681cafffe6781d933fd35b28b99d857f5ecbe54ae691a80268485d72e095d6f4418d1fe81845af24f4b5882b1f1b2b658f9ba5df4791d383b2d7d6fb57a6';

// HOTEL REGISTER
export const hotelRegister = async (req, res) => {
  try {
    const { name, email, password, phone, address, type } = req.body;

    // Check if hotel already exists
    const existingHotel = await HotelModel.findOne({ email });
    if (existingHotel) return res.status(400).json({ message: 'Hotel already exists' });

    // Verify email with OTP
    const isEmailVerified = await checkEmailVerification(email, 'hotel');
    if (!isEmailVerified) {
      return res.status(400).json({ 
        message: 'Email not verified. Please verify your email with OTP first.' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newHotel = await HotelModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      type,
    });

    // Clean up verified OTP record
    await OTP.deleteMany({ email, userType: 'hotel' });

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name, 'hotel');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    const token = jwt.sign({ id: newHotel._id, role: 'hotel' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ 
      token, 
      user: {
        _id: newHotel._id,
        name: newHotel.name,
        email: newHotel.email,
        role: 'hotel',
        phone: newHotel.phone,
        address: newHotel.address,
        type: newHotel.type
      }
    });
  } catch (error) {
    console.error('Hotel Register Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const hotelLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hotel = await HotelModel.findOne({ email });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const isMatch = await bcrypt.compare(password, hotel.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: hotel._id, role: 'hotel' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ 
      token, 
      user: {
        _id: hotel._id,
        name: hotel.name,
        email: hotel.email,
        role: 'hotel',
        phone: hotel.phone,
        address: hotel.address,
        type: hotel.type
      }
    });
  } catch (error) {
    console.error('Hotel Login Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// SELLER REGISTER
export const sellerRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email, role: 'seller' });
    if (existingUser) {
      return res.status(400).json({ message: 'Seller with this email already exists' });
    }

    // Verify email with OTP
    const isEmailVerified = await checkEmailVerification(email, 'seller');
    if (!isEmailVerified) {
      return res.status(400).json({ 
        message: 'Email not verified. Please verify your email with OTP first.' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSeller = new User({
      name,
      email,
      password: hashedPassword,
      role: 'seller'
    });

    await newSeller.save();

    // Clean up verified OTP record
    await OTP.deleteMany({ email, userType: 'seller' });

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name, 'seller');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    const token = jwt.sign({ id: newSeller._id, role: 'seller' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ 
      message: 'Seller registered successfully',
      token,
      user: {
        _id: newSeller._id,
        name: newSeller.name,
        email: newSeller.email,
        role: newSeller.role
      }
    });
  } catch (error) {
    console.error('Seller Register Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// SELLER LOGIN
export const sellerLogin = async (req, res) => {
  try {
    console.log('=== SELLER LOGIN REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { email, password } = req.body;
    console.log('Extracted email:', email);
    console.log('Extracted password:', password ? '[PRESENT]' : '[MISSING]');

    // Validate required fields
    if (!email || !password) {
      console.log('Validation failed: missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Looking for seller with email:', email);
    // Find seller by email and role
    const seller = await User.findOne({ email, role: 'seller' });
    console.log('Seller found:', seller ? 'YES' : 'NO');
    
    if (!seller) {
      console.log('No seller found with email:', email);
      return res.status(404).json({ message: 'Seller not found' });
    }

    console.log('Comparing passwords...');
    // Compare passwords
    const isMatch = await bcrypt.compare(password, seller.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for seller:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Generating JWT token...');
    // Generate JWT token
    const token = jwt.sign(
      { id: seller._id, role: 'seller' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('JWT token generated successfully');

    // Send response
    console.log('Sending successful response');
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
      },
    });
  } catch (error) {
    console.error('=== SELLER LOGIN ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};