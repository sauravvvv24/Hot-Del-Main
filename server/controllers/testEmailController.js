// controllers/testEmailController.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const testEmail = async (req, res) => {
  try {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter verified successfully');

    const testEmail = req.body.email || 'test@example.com';
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: 'Test Email from Hot-Del',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">Test Email</h1>
          <p>This is a test email from Hot-Del to verify email configuration.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `
    };

    console.log('Sending test email to:', testEmail);
    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully:', info.messageId);

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
      sentTo: testEmail
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
};

export default { testEmail };
