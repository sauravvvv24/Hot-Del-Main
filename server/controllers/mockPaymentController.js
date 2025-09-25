// controllers/mockPaymentController.js
import Order from '../models/Order.js';

// Mock payment processing for demo purposes
export const processMockPayment = async (req, res) => {
  try {
    const { orderId, paymentId, method, signature } = req.body;
    
    // Find the order
    const order = await Order.findById(orderId).populate('hotelId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns this order
    if (order.hotelId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to order' });
    }
    
    // Ensure GST and total amounts are calculated if missing
    let updateData = {
      paymentStatus: 'paid',
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      paidAt: new Date(),
      status: 'confirmed',
      invoiceNumber: `INV-DEMO-${Date.now()}-${orderId.slice(-6)}`,
      paymentMethod: 'online',
      // Update all order items to confirmed status
      'items.$[].status': 'confirmed'
    };

    // Calculate GST and total if they're missing or zero
    if (!order.gstAmount || order.gstAmount === 0) {
      const calculatedGstAmount = order.subtotal * 0.18;
      const calculatedTotal = order.subtotal + calculatedGstAmount;
      
      updateData.gstAmount = calculatedGstAmount;
      updateData.tax = calculatedGstAmount; // For backward compatibility
      updateData.totalAmount = calculatedTotal;
    }

    // Update order with mock payment details
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('hotelId');
    
    console.log(`Mock payment processed for order ${orderId}:`);
    console.log(`- Payment Status: ${updatedOrder.paymentStatus}`);
    console.log(`- Order Status: ${updatedOrder.status}`);
    console.log(`- Items Status: ${updatedOrder.items.map(item => item.status).join(', ')}`);
    
    res.json({
      success: true,
      message: 'Mock payment processed successfully',
      order: updatedOrder,
      paymentId: paymentId
    });
    
  } catch (error) {
    console.error('Error processing mock payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process mock payment',
      error: error.message 
    });
  }
};

// Get payment status for demo
export const getMockPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId).select('paymentStatus razorpayPaymentId paidAt totalAmount');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      success: true,
      paymentStatus: order.paymentStatus,
      paymentId: order.razorpayPaymentId,
      paidAt: order.paidAt,
      amount: order.totalAmount
    });
    
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment status' 
    });
  }
};

// Create mock order for demo
export const createMockOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Find the order
    const order = await Order.findById(orderId).populate('hotelId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns this order
    if (order.hotelId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to order' });
    }
    
    // Generate mock Razorpay order ID
    const mockRazorpayOrderId = `order_demo_${Date.now()}`;
    
    // Update order with mock Razorpay order ID
    await Order.findByIdAndUpdate(orderId, {
      razorpayOrderId: mockRazorpayOrderId,
      paymentStatus: 'pending'
    });
    
    res.json({
      success: true,
      razorpayOrderId: mockRazorpayOrderId,
      amount: Math.round(order.totalAmount * 100), // Convert to paise
      currency: 'INR',
      key: 'rzp_demo_key', // Demo key
      order: {
        id: order._id,
        total: order.totalAmount,
        items: order.items.length
      },
      hotel: {
        name: order.hotelId.name,
        email: order.hotelId.email,
        phone: order.hotelId.phone
      }
    });
    
  } catch (error) {
    console.error('Error creating mock order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create mock order',
      error: error.message 
    });
  }
};
