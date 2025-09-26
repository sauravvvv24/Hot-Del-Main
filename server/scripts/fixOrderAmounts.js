// scripts/fixOrderAmounts.js
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const fixOrderAmounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find orders with missing or zero GST amounts
    const ordersToFix = await Order.find({
      $or: [
        { gstAmount: { $exists: false } },
        { gstAmount: 0 },
        { gstAmount: null },
        { totalAmount: 0 },
        { totalAmount: null }
      ]
    });

    console.log(`Found ${ordersToFix.length} orders to fix`);

    for (const order of ordersToFix) {
      const calculatedGstAmount = order.subtotal * 0.05;
      const calculatedTotal = order.subtotal + calculatedGstAmount;

      await Order.findByIdAndUpdate(order._id, {
        gstAmount: calculatedGstAmount,
        tax: calculatedGstAmount, // For backward compatibility
        totalAmount: calculatedTotal
      });

      console.log(`Fixed order ${order._id}: Subtotal: ₹${order.subtotal}, GST: ₹${calculatedGstAmount.toFixed(2)}, Total: ₹${calculatedTotal.toFixed(2)}`);
    }

    console.log('All orders fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing orders:', error);
    process.exit(1);
  }
};

fixOrderAmounts();
