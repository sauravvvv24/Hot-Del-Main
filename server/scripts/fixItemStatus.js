// scripts/fixItemStatus.js
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const fixItemStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all orders where order status is confirmed but items are still pending
    const ordersToFix = await Order.find({
      status: 'confirmed',
      'items.status': 'pending'
    });

    console.log(`Found ${ordersToFix.length} orders with confirmed status but pending items`);

    for (const order of ordersToFix) {
      console.log(`\nFixing order ${order._id}:`);
      console.log(`- Order Status: ${order.status}`);
      console.log(`- Items with pending status: ${order.items.filter(item => item.status === 'pending').length}`);
      
      // Update all items to confirmed status
      await Order.findByIdAndUpdate(order._id, {
        'items.$[].status': 'confirmed'
      });
      
      console.log(`✅ Updated all items to confirmed status`);
    }

    // Also fix any orders that are paid but still have pending status
    const paidPendingOrders = await Order.find({
      paymentStatus: 'paid',
      status: 'pending'
    });

    console.log(`\nFound ${paidPendingOrders.length} paid orders with pending status`);

    for (const order of paidPendingOrders) {
      console.log(`\nFixing paid order ${order._id}:`);
      
      await Order.findByIdAndUpdate(order._id, {
        status: 'confirmed',
        'items.$[].status': 'confirmed'
      });
      
      console.log(`✅ Updated order and items to confirmed status`);
    }

    console.log('\n🎉 All order statuses fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing item statuses:', error);
    process.exit(1);
  }
};

fixItemStatus();
