// scripts/checkOrderStatus.js
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const checkOrderStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the specific order from the screenshots
    const orderId = '68cfee10da3f5de780e51137'; // Order ID from the screenshots
    
    const order = await Order.findById(orderId);
    
    if (order) {
      console.log(`\nOrder ${orderId} current status:`);
      console.log(`- Order Status: ${order.status}`);
      console.log(`- Payment Status: ${order.paymentStatus}`);
      console.log(`- Payment Method: ${order.paymentMethod}`);
      console.log(`- Payment ID: ${order.razorpayPaymentId}`);
      console.log(`- Paid At: ${order.paidAt}`);
      console.log(`- Invoice Number: ${order.invoiceNumber}`);
      
      console.log(`\nItem statuses:`);
      order.items.forEach((item, index) => {
        console.log(`- Item ${index + 1}: ${item.status}`);
      });
      
      // If payment is completed but status is still pending, fix it
      if (order.razorpayPaymentId && order.paymentStatus === 'paid' && order.status === 'pending') {
        console.log('\n🔧 Fixing order status...');
        
        await Order.findByIdAndUpdate(orderId, {
          status: 'confirmed',
          'items.$[].status': 'confirmed'
        });
        
        console.log('✅ Order status updated to confirmed');
      } else if (order.razorpayPaymentId && order.status === 'pending') {
        console.log('\n🔧 Fixing payment and order status...');
        
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          status: 'confirmed',
          'items.$[].status': 'confirmed'
        });
        
        console.log('✅ Payment and order status updated');
      } else {
        console.log('\n✅ Order status is correct');
      }
      
      // Show updated status
      const updatedOrder = await Order.findById(orderId);
      console.log(`\nUpdated status:`);
      console.log(`- Order Status: ${updatedOrder.status}`);
      console.log(`- Payment Status: ${updatedOrder.paymentStatus}`);
      
    } else {
      console.log(`Order ${orderId} not found`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking order status:', error);
    process.exit(1);
  }
};

checkOrderStatus();
