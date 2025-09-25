// config/emailConfig.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter with Gmail configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS  // Your Gmail app password
    }
  });
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, userType) => {
  try {
    const transporter = createTransporter();
    
    const userTypeText = userType === 'hotel' ? 'Hotel' : 'Seller';
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Hot-Del ${userTypeText} Registration - Email Verification`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Hot-Del</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">${userTypeText} Registration</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Email Verification Required</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for registering as a ${userTypeText.toLowerCase()} with Hot-Del! To complete your registration, please verify your email address using the OTP below:
            </p>
            
            <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;">
              <p style="color: #333; font-size: 14px; margin-bottom: 10px;">Your Verification Code</p>
              <h1 style="color: #667eea; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Important:</strong> This OTP will expire in 10 minutes. Please enter it on the registration page to continue.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you didn't request this registration, please ignore this email. Your account will not be created without verification.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <p style="color: #999; font-size: 12px;">
              © 2024 Hot-Del. All rights reserved.<br>
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome/congratulations email after successful registration
export const sendWelcomeEmail = async (email, name, userType) => {
  try {
    const transporter = createTransporter();
    
    const userTypeText = userType === 'hotel' ? 'Hotel' : 'Seller';
    const dashboardUrl = userType === 'hotel' ? '/hotel-login' : '/seller-login';
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `🎉 Welcome to Hot-Del - Registration Successful!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Welcome to Hot-Del</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Registration Successful! 🚀</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Dear <strong>${name}</strong>,
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Congratulations! Your ${userTypeText.toLowerCase()} account has been successfully created and verified. You're now part of the Hot-Del family!
            </p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 25px; text-align: center; margin: 25px 0; color: white;">
              <h3 style="margin: 0 0 15px 0; font-size: 20px;">🎯 What's Next?</h3>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">
                ${userType === 'hotel' 
                  ? 'Start browsing premium suppliers and streamline your procurement process!'
                  : 'Begin listing your products and reach 500+ hotels nationwide!'
                }
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173${dashboardUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                🚀 Get Started Now
              </a>
            </div>
            
            ${userType === 'hotel' ? `
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px;">
              <h4 style="color: #333; margin: 0 0 10px 0;">🏨 Hotel Benefits:</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Access to 200+ verified suppliers</li>
                <li>Save 15+ hours weekly on procurement</li>
                <li>Quality guaranteed with on-time delivery</li>
                <li>Dedicated account manager support</li>
              </ul>
            </div>
            ` : `
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px;">
              <h4 style="color: #333; margin: 0 0 10px 0;">🛍️ Seller Benefits:</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Reach 500+ hotels nationwide</li>
                <li>Zero setup fees to start selling</li>
                <li>Advanced analytics and insights</li>
                <li>24/7 dedicated seller support</li>
              </ul>
            </div>
            `}
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              If you have any questions or need assistance, our support team is here to help 24/7.
            </p>
            
            <p style="color: #666; font-size: 16px; margin-top: 20px;">
              Welcome aboard! 🎊<br>
              <strong>The Hot-Del Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <p style="color: #999; font-size: 12px;">
              © 2024 Hot-Del. All rights reserved.<br>
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

export default { generateOTP, sendOTPEmail, sendWelcomeEmail };
