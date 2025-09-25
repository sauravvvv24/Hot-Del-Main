// controllers/paymentController.js
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import HotelModel from '../models/Hotel.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
export const createPaymentOrder = async (req, res) => {
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
    
    // Calculate total amount in paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(order.totalAmount * 100);
    
    // Generate unique receipt ID
    const receipt = `order_${orderId}_${Date.now()}`;
    
    // Create Razorpay order
    const razorpayOrderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      payment_capture: 1, // Auto capture payment
      notes: {
        orderId: orderId,
        hotelId: order.hotelId._id.toString(),
        hotelName: order.hotelId.name
      }
    };
    
    const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);
    
    // Update order with Razorpay order ID
    await Order.findByIdAndUpdate(orderId, {
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: 'pending'
    });
    
    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
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
    console.error('Error creating payment order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment order',
      error: error.message 
    });
  }
};

// Verify payment signature and update order
export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = req.body;
    
    // Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    // Verify signature
    if (expectedSignature === razorpay_signature) {
      // Payment is authentic, update order
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paidAt: new Date(),
          status: 'confirmed', // Update order status to confirmed
          invoiceNumber: `INV-${Date.now()}-${orderId.slice(-6)}`,
          // Update all order items to confirmed status
          'items.$[].status': 'confirmed'
        },
        { new: true }
      ).populate('hotelId');
      
      if (!updatedOrder) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found' 
        });
      }
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        order: updatedOrder,
        paymentId: razorpay_payment_id
      });
      
    } else {
      // Invalid signature
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed'
      });
      
      res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed',
      error: error.message 
    });
  }
};

// Handle payment failure
export const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId, error } = req.body;
    
    // Update order status to failed
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed'
    });
    
    res.json({
      success: true,
      message: 'Payment failure recorded'
    });
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record payment failure' 
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
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

// Webhook handler for Razorpay events
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
    
    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;
    
    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        // Payment was successful
        await handlePaymentCaptured(paymentEntity);
        break;
        
      case 'payment.failed':
        // Payment failed
        await handlePaymentFailed(paymentEntity);
        break;
        
      default:
        console.log('Unhandled webhook event:', event);
    }
    
    res.json({ status: 'ok' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Helper function to handle successful payment
const handlePaymentCaptured = async (paymentEntity) => {
  try {
    const orderId = paymentEntity.notes?.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        razorpayPaymentId: paymentEntity.id,
        paidAt: new Date(paymentEntity.created_at * 1000),
        status: 'confirmed'
      });
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
};

// Helper function to handle failed payment
const handlePaymentFailed = async (paymentEntity) => {
  try {
    const orderId = paymentEntity.notes?.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed'
      });
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};
