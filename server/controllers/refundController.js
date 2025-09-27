// controllers/refundController.js
import Order from '../models/Order.js';
import {
  isCancellationAllowed,
  sendCODCancellationWithin24Hours,
  sendCODCancellationAfter24Hours,
  sendCODSellerCancellation,
  sendOnlinePaymentCancellationWithin24Hours,
  sendOnlinePaymentCancellationAfter24Hours,
  sendOnlinePaymentSellerCancellation
} from '../services/refundService.js';

// Cancel order by hotel user
export const cancelOrderByHotel = async (req, res) => {
  try {
    console.log('=== HOTEL CANCELLATION REQUEST ===');
    const { orderId } = req.params;
    const hotelId = req.user._id;
    console.log('Order ID:', orderId);
    console.log('Hotel ID:', hotelId);
    console.log('User:', req.user);

    // Find the order
    console.log('Finding order...');
    const order = await Order.findById(orderId).populate('hotelId');
    console.log('Order found:', !!order);
    
    if (!order) {
      console.log('Order not found in database');
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    console.log('Order details:', {
      id: order._id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      hotelId: order.hotelId._id,
      billingEmail: order.billingInfo?.email,
      orderedAt: order.orderedAt
    });

    // Verify order belongs to the hotel
    console.log('Verifying order ownership...');
    if (order.hotelId._id.toString() !== hotelId.toString()) {
      console.log('Order ownership verification failed');
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this order'
      });
    }
    console.log('Order ownership verified');

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      console.log('Order is already cancelled');
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Check if order can be cancelled
    console.log('Checking cancellation eligibility...');
    const cancellationCheck = isCancellationAllowed(order, 'hotel');
    console.log('Cancellation check result:', cancellationCheck);
    
    if (!cancellationCheck.allowed) {
      // Send rejection email based on payment method
      if (order.paymentMethod === 'cod') {
        await sendCODCancellationAfter24Hours(order);
      } else if (order.paymentMethod === 'online') {
        await sendOnlinePaymentCancellationAfter24Hours(order);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled after 24 hours of placement',
        hoursSinceOrder: Math.round(cancellationCheck.hoursSinceOrder),
        policy: 'Orders can only be cancelled within 24 hours of placement'
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelledBy = 'hotel';
    order.cancellationReason = 'Cancelled by hotel within 24 hours';
    
    order.items.forEach(item => {
      item.status = 'cancelled';
    });

    // Update payment status for refund processing
    if (order.paymentMethod === 'online' && order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
      order.refundStatus = 'pending';
      order.refundAmount = order.totalAmount;
    } else {
      order.refundStatus = 'not_applicable';
    }

    await order.save();

    // Send appropriate email based on payment method
    let emailResult;
    console.log(`Sending cancellation email for order ${order._id}, payment method: ${order.paymentMethod}, email: ${order.billingInfo.email}`);
    
    try {
      if (order.paymentMethod === 'cod') {
        emailResult = await sendCODCancellationWithin24Hours(order);
      } else if (order.paymentMethod === 'online') {
        emailResult = await sendOnlinePaymentCancellationWithin24Hours(order);
      }
      console.log('Email result:', emailResult);
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      emailResult = { success: false, error: emailError.message };
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        id: order._id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        refundInfo: order.paymentMethod === 'online' ? 
          'Refund will be processed within 3 business days' : 
          'No payment was processed for this COD order'
      },
      emailSent: emailResult?.success || false
    });

  } catch (error) {
    console.error('Error cancelling order by hotel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// Cancel order by seller
export const cancelOrderBySeller = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sellerId = req.user._id;

    // Find the order
    const order = await Order.findById(orderId).populate('hotelId');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify seller has items in this order
    const sellerHasItems = order.items.some(item => 
      item.sellerId.toString() === sellerId.toString()
    );

    if (!sellerHasItems) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this order'
      });
    }

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelledBy = 'seller';
    order.cancellationReason = 'Cancelled by seller due to unforeseen circumstances';
    
    order.items.forEach(item => {
      if (item.sellerId.toString() === sellerId.toString()) {
        item.status = 'cancelled';
      }
    });

    // Update payment status for immediate refund if online payment
    if (order.paymentMethod === 'online' && order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
      order.refundStatus = 'pending';
      order.refundAmount = order.totalAmount;
    } else {
      order.refundStatus = 'not_applicable';
    }

    await order.save();

    // Send appropriate apology email based on payment method
    let emailResult;
    if (order.paymentMethod === 'cod') {
      emailResult = await sendCODSellerCancellation(order);
    } else if (order.paymentMethod === 'online') {
      emailResult = await sendOnlinePaymentSellerCancellation(order);
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled by seller successfully',
      order: {
        id: order._id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        refundInfo: order.paymentMethod === 'online' ? 
          'Immediate refund will be processed within 24 hours' : 
          'No payment was processed for this COD order',
        compensation: order.paymentMethod === 'online' ? 
          '15% discount offered for next order' : 
          '10% discount offered for next order'
      },
      emailSent: emailResult?.success || false
    });

  } catch (error) {
    console.error('Error cancelling order by seller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// Get refund policy information
export const getRefundPolicy = async (req, res) => {
  try {
    const policy = {
      cashOnDelivery: {
        hotelCancellation: {
          within24Hours: {
            allowed: true,
            refund: 'No payment processed, no refund needed',
            timeline: 'Immediate'
          },
          after24Hours: {
            allowed: false,
            reason: 'Order processing has begun',
            action: 'Order will be delivered as scheduled'
          }
        },
        sellerCancellation: {
          allowed: true,
          refund: 'No payment processed, no refund needed',
          compensation: '10% discount on next order',
          timeline: 'Immediate'
        }
      },
      onlinePayment: {
        hotelCancellation: {
          within24Hours: {
            allowed: true,
            refund: 'Full refund to original payment method',
            timeline: '3 business days'
          },
          after24Hours: {
            allowed: false,
            reason: 'Payment processed and order being prepared',
            action: 'Order will be delivered as scheduled'
          }
        },
        sellerCancellation: {
          allowed: true,
          refund: 'Full refund to original payment method',
          compensation: '15% discount on next order',
          timeline: '24 hours (immediate processing)'
        }
      },
      generalTerms: {
        cancellationWindow: '24 hours from order placement',
        refundMethods: 'Original payment method only',
        supportContact: 'support@hot-del.com',
        businessDays: 'Monday to Friday, excluding public holidays'
      }
    };

    res.status(200).json({
      success: true,
      policy
    });
  } catch (error) {
    console.error('Error fetching refund policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refund policy',
      error: error.message
    });
  }
};

// Check if order can be cancelled
export const checkCancellationEligibility = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    let authorized = false;
    if (userRole === 'hotel' && order.hotelId.toString() === userId.toString()) {
      authorized = true;
    } else if (userRole === 'seller') {
      authorized = order.items.some(item => item.sellerId.toString() === userId.toString());
    }

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to check this order'
      });
    }

    // Check cancellation eligibility
    const cancellationCheck = isCancellationAllowed(order, userRole === 'hotel' ? 'hotel' : 'seller');

    res.status(200).json({
      success: true,
      eligible: cancellationCheck.allowed,
      reason: cancellationCheck.reason,
      hoursSinceOrder: Math.round(cancellationCheck.hoursSinceOrder),
      order: {
        id: order._id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderedAt: order.orderedAt,
        totalAmount: order.totalAmount
      },
      policy: {
        timeLimit: '24 hours from order placement',
        currentStatus: cancellationCheck.allowed ? 'Within cancellation window' : 'Cancellation window expired'
      }
    });

  } catch (error) {
    console.error('Error checking cancellation eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check cancellation eligibility',
      error: error.message
    });
  }
};

export default {
  cancelOrderByHotel,
  cancelOrderBySeller,
  getRefundPolicy,
  checkCancellationEligibility
};
