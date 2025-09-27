// test-cancellation-email.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import { sendOnlinePaymentCancellationWithin24Hours } from './services/refundService.js';

dotenv.config();

async function testCancellationEmail() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the order we just created
    const orderId = '68d8091723494931851b7df8';
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.log('Order not found');
      return;
    }

    console.log('Order found:', {
      id: order._id,
      billingEmail: order.billingInfo.email,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount
    });

    // Test sending cancellation email
    console.log('Sending cancellation email...');
    const emailResult = await sendOnlinePaymentCancellationWithin24Hours(order);
    
    console.log('Email result:', emailResult);
    
    if (emailResult.success) {
      console.log('✅ Cancellation email sent successfully!');
      console.log('📧 Email sent to:', order.billingInfo.email);
      console.log('📨 Message ID:', emailResult.messageId);
    } else {
      console.log('❌ Failed to send email:', emailResult.error);
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testCancellationEmail();
