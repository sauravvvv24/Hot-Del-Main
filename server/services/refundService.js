// services/refundService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter with Gmail configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Calculate hours since order placement
export const getHoursSinceOrder = (orderDate) => {
  const now = new Date();
  const orderTime = new Date(orderDate);
  const diffInMs = now - orderTime;
  return diffInMs / (1000 * 60 * 60); // Convert to hours
};

// Check if cancellation is allowed based on refund policy
export const isCancellationAllowed = (order, cancelledBy) => {
  const hoursSinceOrder = getHoursSinceOrder(order.orderedAt);
  
  // Sellers can always cancel (with different refund terms)
  if (cancelledBy === 'seller') {
    return {
      allowed: true,
      reason: 'seller_cancellation',
      hoursSinceOrder
    };
  }
  
  // Hotel users have 24-hour window
  if (cancelledBy === 'hotel') {
    if (hoursSinceOrder <= 24) {
      return {
        allowed: true,
        reason: 'within_24_hours',
        hoursSinceOrder
      };
    } else {
      return {
        allowed: false,
        reason: 'after_24_hours',
        hoursSinceOrder
      };
    }
  }
  
  return {
    allowed: false,
    reason: 'unknown',
    hoursSinceOrder
  };
};

// Email template for COD cancellation by hotel within 24 hours
export const sendCODCancellationWithin24Hours = async (order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.billingInfo.email,
      subject: '✅ Order Cancellation Confirmed - Hot-Del',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">✅ Order Cancelled</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2>Order Cancellation Successful</h2>
            <p>Dear <strong>${order.billingInfo.fullName}</strong>,</p>
            <p>Your order has been successfully cancelled. Since this was a Cash on Delivery order cancelled within 24 hours, no payment has been processed.</p>
            
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 10px; padding: 20px; margin: 25px 0;">
              <h3>📋 Order Details</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
              <p><strong>Payment Method:</strong> Cash on Delivery</p>
            </div>
            
            <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
              <p style="color: #166534; margin: 0;">
                <strong>✅ No Payment Required:</strong> Since this was a COD order, no payment was processed.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending COD cancellation email:', error);
    return { success: false, error: error.message };
  }
};

// Email template for COD cancellation by hotel after 24 hours (not allowed)
export const sendCODCancellationAfter24Hours = async (order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.billingInfo.email,
      subject: '❌ Order Cancellation Not Allowed - Hot-Del',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">❌ Cancellation Not Allowed</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2>Order Cannot Be Cancelled</h2>
            <p>Dear <strong>${order.billingInfo.fullName}</strong>,</p>
            <p>We received your request to cancel the order, but unfortunately, the cancellation window has expired.</p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0;">
                <strong>⏰ Cancellation Policy:</strong> Cash on Delivery orders can only be cancelled within 24 hours of placement.
              </p>
            </div>
            
            <p>Your order is currently being processed and will be delivered as scheduled.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending COD cancellation rejection email:', error);
    return { success: false, error: error.message };
  }
};

// Email template for COD cancellation by seller
export const sendCODSellerCancellation = async (order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.billingInfo.email,
      subject: '🙏 Order Cancelled by Seller - Sincere Apologies - Hot-Del',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">🙏 Sincere Apologies</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2>Order Cancelled by Seller</h2>
            <p>Dear <strong>${order.billingInfo.fullName}</strong>,</p>
            <p>We sincerely apologize, but your order has been cancelled by the seller due to unforeseen circumstances.</p>
            
            <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
              <p style="color: #166534; margin: 0;">
                <strong>✅ No Payment Impact:</strong> Since this was a COD order, no payment was processed.
              </p>
            </div>
            
            <p>As compensation, we're offering you a <strong>10% discount</strong> on your next order.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending COD seller cancellation email:', error);
    return { success: false, error: error.message };
  }
};

// Email template for online payment cancellation by hotel within 24 hours
export const sendOnlinePaymentCancellationWithin24Hours = async (order) => {
  try {
    console.log('Creating email transporter for online payment cancellation...');
    const transporter = createTransporter();
    console.log('Transporter created successfully');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.billingInfo.email,
      subject: '✅ Order Cancelled - Refund Processing - Hot-Del',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">✅ Order Cancelled</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2>Order Cancellation & Refund Confirmed</h2>
            <p>Dear <strong>${order.billingInfo.fullName}</strong>,</p>
            <p>Your order has been successfully cancelled. Since you cancelled within 24 hours, you are eligible for a full refund.</p>
            
            <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
              <p style="color: #166534; margin: 0;">
                <strong>💰 Refund Processing:</strong> Your full refund of ₹${Number(order.totalAmount) || 0} will be processed within 3 business days.
              </p>
            </div>
          </div>
        </div>
      `
    };

    console.log('Sending email to:', order.billingInfo.email);
    console.log('Order total amount for email:', order.totalAmount);
    console.log('Order object keys:', Object.keys(order));
    const info = await transporter.sendMail(mailOptions);
    console.log('Online payment cancellation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending online payment cancellation email:', error);
    console.error('Error details:', error);
    return { success: false, error: error.message };
  }
};

// Email template for online payment cancellation by hotel after 24 hours (not allowed)
export const sendOnlinePaymentCancellationAfter24Hours = async (order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.billingInfo.email,
      subject: '❌ Order Cancellation Not Allowed - Hot-Del',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">❌ Cancellation Not Allowed</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2>Order Cannot Be Cancelled</h2>
            <p>Dear <strong>${order.billingInfo.fullName}</strong>,</p>
            <p>We received your request to cancel the order, but unfortunately, the cancellation window has expired for online payment orders.</p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0;">
                <strong>⏰ Cancellation Policy:</strong> Online payment orders can only be cancelled within 24 hours of placement.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending online payment cancellation rejection email:', error);
    return { success: false, error: error.message };
  }
};

// Email template for online payment cancellation by seller
export const sendOnlinePaymentSellerCancellation = async (order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.billingInfo.email,
      subject: '🙏 Order Cancelled by Seller - Immediate Refund Processing - Hot-Del',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">🙏 Sincere Apologies</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2>Order Cancelled by Seller - Immediate Refund</h2>
            <p>Dear <strong>${order.billingInfo.fullName}</strong>,</p>
            <p>We sincerely apologize, but your order has been cancelled by the seller. We are processing your refund immediately.</p>
            
            <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
              <p style="color: #166534; margin: 0;">
                <strong>💰 Immediate Refund:</strong> Your full refund of ₹${Number(order.totalAmount) || 0} will be processed within 24 hours.
              </p>
            </div>
            
            <p>As compensation for this inconvenience, we're offering you a <strong>15% discount</strong> on your next order.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending online payment seller cancellation email:', error);
    return { success: false, error: error.message };
  }
};

export default {
  getHoursSinceOrder,
  isCancellationAllowed,
  sendCODCancellationWithin24Hours,
  sendCODCancellationAfter24Hours,
  sendCODSellerCancellation,
  sendOnlinePaymentCancellationWithin24Hours,
  sendOnlinePaymentCancellationAfter24Hours,
  sendOnlinePaymentSellerCancellation
};
