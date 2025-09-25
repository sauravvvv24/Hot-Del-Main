// scripts/fixOrderStatus.js
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const fixOrderStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find orders that are paid but still have pending status
    const ordersToFix = await Order.find({
      paymentStatus: 'paid',
      status: 'pending'
    });

    console.log(`Found ${ordersToFix.length} paid orders with pending status`);

    for (const order of ordersToFix) {
      await Order.findByIdAndUpdate(order._id, {
        status: 'confirmed',
        'items.$[].status': 'confirmed'
      });

      console.log(`Fixed order ${order._id}: Status changed from pending to confirmed`);
    }

    // Also check for orders with confirmed payment but no payment status
    const ordersWithoutPaymentStatus = await Order.find({
      razorpayPaymentId: { $exists: true, $ne: null },
      paymentStatus: { $ne: 'paid' }
    });

    console.log(`Found ${ordersWithoutPaymentStatus.length} orders with payment ID but incorrect payment status`);

    for (const order of ordersWithoutPaymentStatus) {
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: 'paid',
        status: 'confirmed',
        'items.$[].status': 'confirmed'
      });

      console.log(`Fixed order ${order._id}: Set payment status to paid and order status to confirmed`);
    }

    console.log('All order statuses fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing order statuses:', error);
    process.exit(1);
  }
};

fixOrderStatus();
