// controllers/otpController.js
import OTP from '../models/OTP.js';
import HotelModel from '../models/Hotel.js';
import User from '../models/User.js';
import { generateOTP, sendOTPEmail } from '../config/emailConfig.js';

// Send OTP for email verification
export const sendOTP = async (req, res) => {
  try {
    const { email, userType } = req.body;

    // Validate input
    if (!email || !userType) {
      return res.status(400).json({ 
        message: 'Email and user type are required' 
      });
    }

    if (!['hotel', 'seller'].includes(userType)) {
      return res.status(400).json({ 
        message: 'Invalid user type. Must be hotel or seller' 
      });
    }

    // Check if user already exists
    let existingUser;
    if (userType === 'hotel') {
      existingUser = await HotelModel.findOne({ email });
    } else {
      existingUser = await User.findOne({ email, role: 'seller' });
    }

    if (existingUser) {
      return res.status(400).json({ 
        message: `${userType === 'hotel' ? 'Hotel' : 'Seller'} with this email already exists` 
      });
    }

    // Delete any existing OTP for this email and userType
    await OTP.deleteMany({ email, userType });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    const otpRecord = new OTP({
      email,
      otp,
      userType,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    });

    await otpRecord.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, userType);

    if (!emailResult.success) {
      // If email sending fails, delete the OTP record
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(500).json({ 
        message: 'Failed to send OTP email. Please try again.' 
      });
    }

    res.status(200).json({
      message: 'OTP sent successfully to your email',
      email,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ 
      message: 'Server error while sending OTP' 
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, userType } = req.body;

    // Validate input
    if (!email || !otp || !userType) {
      return res.status(400).json({ 
        message: 'Email, OTP, and user type are required' 
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ 
      email, 
      userType, 
      otp,
      isVerified: false 
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        message: 'Invalid or expired OTP' 
      });
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ 
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    // Mark OTP as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    res.status(200).json({
      message: 'OTP verified successfully',
      email,
      userType,
      verified: true
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ 
      message: 'Server error while verifying OTP' 
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email, userType } = req.body;

    // Validate input
    if (!email || !userType) {
      return res.status(400).json({ 
        message: 'Email and user type are required' 
      });
    }

    // Check if there's a recent OTP request (rate limiting)
    const recentOTP = await OTP.findOne({ 
      email, 
      userType,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) } // Within last minute
    });

    if (recentOTP) {
      return res.status(429).json({ 
        message: 'Please wait at least 1 minute before requesting a new OTP' 
      });
    }

    // Delete existing OTPs
    await OTP.deleteMany({ email, userType });

    // Generate and send new OTP
    const otp = generateOTP();

    const otpRecord = new OTP({
      email,
      otp,
      userType,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await otpRecord.save();

    const emailResult = await sendOTPEmail(email, otp, userType);

    if (!emailResult.success) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(500).json({ 
        message: 'Failed to send OTP email. Please try again.' 
      });
    }

    res.status(200).json({
      message: 'New OTP sent successfully to your email',
      email,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ 
      message: 'Server error while resending OTP' 
    });
  }
};

// Check if email is verified (helper function for registration)
export const checkEmailVerification = async (email, userType) => {
  try {
    const verifiedOTP = await OTP.findOne({ 
      email, 
      userType, 
      isVerified: true,
      expiresAt: { $gte: new Date() }
    });

    return !!verifiedOTP;
  } catch (error) {
    console.error('Check email verification error:', error);
    return false;
  }
};
