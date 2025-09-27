// test-cancellation-debug.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import { sendOnlinePaymentCancellationWithin24Hours } from './services/refundService.js';

dotenv.config();

async function testCancellationDebug() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the latest order
    const orderId = '68d80bb17d62033990ed461c'; // Latest order from logs
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.log('Order not found');
      return;
    }

    console.log('=== ORDER DEBUG INFO ===');
    console.log('Order ID:', order._id);
    console.log('Total Amount:', order.totalAmount);
    console.log('Subtotal:', order.subtotal);
    console.log('Tax:', order.tax);
    console.log('GST Amount:', order.gstAmount);
    console.log('Payment Method:', order.paymentMethod);
    console.log('Payment Status:', order.paymentStatus);
    console.log('Billing Email:', order.billingInfo?.email);
    console.log('Order Keys:', Object.keys(order.toObject()));
    console.log('Full Order Object:', JSON.stringify(order.toObject(), null, 2));

    // Test sending cancellation email
    console.log('\n=== TESTING EMAIL ===');
    const emailResult = await sendOnlinePaymentCancellationWithin24Hours(order);
    
    console.log('Email result:', emailResult);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testCancellationDebug();
