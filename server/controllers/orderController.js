// Code Edit:
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import {
  isCancellationAllowed,
  sendCODCancellationWithin24Hours,
  sendCODCancellationAfter24Hours,
  sendOnlinePaymentCancellationWithin24Hours,
  sendOnlinePaymentCancellationAfter24Hours,
  sendCODSellerCancellation,
  sendOnlinePaymentSellerCancellation
} from '../services/refundService.js';
import Product from '../models/Product.js';
import HotelModel from '../models/Hotel.js';

export const placeOrder = async (req, res) => {
  const { hotelId, billingInfo, paymentMethod, items, subtotal, gstAmount, totalAmount, tax, total } = req.body;

  try {
    // Validate required fields
    if (!hotelId || !billingInfo || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing required order information' });
    }

    // Fetch product details, validate stock, and prepare order items
    const orderItems = [];
    const processedItems = []; // Track items for potential rollback
    
    for (const item of items) {
      const product = await Product.findById(item.productId).populate('seller');
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      
      // Check if product is active
      if (!product.isActive) {
        return res.status(400).json({ message: `Product "${product.name}" is not available` });
      }
      
      // Check stock availability
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }
      
      orderItems.push({
        productId: product._id,
        sellerId: product.seller._id,
        quantity: item.quantity,
        price: item.price
      });
    }

    // Reduce product quantities (inventory management)
    for (const item of items) {
      try {
        await Product.findByIdAndUpdate(
          item.productId,
          { 
            $inc: { stock: -item.quantity },
            $set: { outOfStock: false } // Will be updated below if needed
          }
        );
        
        processedItems.push(item); // Track successful updates
        
        // Check if product is now out of stock and update accordingly
        const updatedProduct = await Product.findById(item.productId);
        if (updatedProduct.stock <= 0) {
          await Product.findByIdAndUpdate(item.productId, { 
            outOfStock: true,
            stock: 0 // Ensure stock doesn't go negative
          });
        }
      } catch (inventoryError) {
        // Rollback inventory changes if any update fails
        console.error('Inventory update failed, rolling back:', inventoryError);
        await rollbackInventory(processedItems);
        return res.status(500).json({ message: 'Inventory update failed', error: inventoryError.message });
      }
    }

    // Calculate amounts if not provided
    const calculatedSubtotal = subtotal || orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const calculatedGstAmount = gstAmount || (calculatedSubtotal * 0.05); // 5% GST
    const calculatedTotal = totalAmount || total || (calculatedSubtotal + calculatedGstAmount);

    // Create and save the order
    const order = new Order({
      hotelId,
      items: orderItems,
      subtotal: calculatedSubtotal,
      tax: tax || calculatedGstAmount, // Keep for backward compatibility
      gstAmount: calculatedGstAmount,
      totalAmount: calculatedTotal,
      billingInfo,
      paymentMethod: paymentMethod || 'cod'
    });

    await order.save();
    
    console.log(`Order created: ${order._id}`);
    console.log(`- Initial Status: ${order.status}`);
    console.log(`- Payment Method: ${order.paymentMethod}`);
    console.log(`- Payment Status: ${order.paymentStatus}`);

    // Clear cart after successful order
    await Cart.findOneAndUpdate({ hotelId }, { items: [] });

    res.status(201).json({ 
      message: 'Order placed successfully', 
      orderId: order._id,
      order 
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ message: 'Order failed', error: error.message });
  }
};

// Allow a hotel user to cancel their own order
export const cancelOrderByHotel = async (req, res) => {
  try {
    console.log('=== HOTEL CANCELLATION REQUEST (ORDER CONTROLLER) ===');
    const { orderId } = req.params;
    const actingUser = req.user; // Could be a Hotel or User document
    console.log('Order ID:', orderId);
    console.log('Acting User:', actingUser);

    // Ensure only hotels can cancel their orders
    // Check both 'role' (for User model) and 'type' (for Hotel model)
    const isHotel = actingUser && (actingUser.role === 'hotel' || actingUser.type);
    if (!isHotel) {
      console.log('Access denied: Not a hotel user. User:', actingUser);
      return res.status(403).json({ message: 'Only hotel accounts can cancel orders' });
    }
    console.log('Access granted: Hotel user verified');

    const order = await Order.findById(orderId).populate('hotelId');
    console.log('Order found:', !!order);
    
    if (!order) {
      console.log('Order not found in database');
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('Order details:', {
      id: order._id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      billingEmail: order.billingInfo?.email,
      orderedAt: order.orderedAt
    });

    // Verify the order belongs to this hotel
    console.log('Verifying order ownership...');
    console.log('Order hotelId:', order.hotelId._id.toString());
    console.log('Acting user ID:', (actingUser.id || actingUser._id).toString());
    
    if (order.hotelId._id.toString() !== (actingUser.id || actingUser._id).toString()) {
      console.log('Order ownership verification failed');
      return res.status(403).json({ message: 'You are not authorized to cancel this order' });
    }
    console.log('Order ownership verified successfully');

    // If order already delivered in full, or already cancelled, prevent cancellation
    console.log('Checking order status for cancellation eligibility...');
    if (order.status === 'delivered') {
      console.log('Order already delivered - cannot cancel');
      return res.status(400).json({ message: 'Delivered orders cannot be cancelled' });
    }
    if (order.status === 'cancelled') {
      console.log('Order already cancelled');
      return res.status(400).json({ message: 'Order is already cancelled' });
    }
    console.log('Order status check passed - proceeding with cancellation');

    // Determine which items can be cancelled and restore inventory for them
    const cancellableItems = [];
    let hasUndeliverableItems = false; // tracks if some items are already delivered

    order.items.forEach(item => {
      if (item.status === 'delivered') {
        hasUndeliverableItems = true;
        return; // skip delivered items
      }
      if (item.status !== 'cancelled') {
        cancellableItems.push({ productId: item.productId, quantity: item.quantity });
        item.status = 'cancelled';
      }
    });

    // If nothing to cancel
    if (cancellableItems.length === 0) {
    }

    // Restore inventory for cancelled items
    await restoreInventory(cancellableItems);

    // IMPORTANT: Save original total amount BEFORE recalculating (for email)
    const originalTotalAmount = order.totalAmount;
    console.log('Original total amount before recalc:', originalTotalAmount);

    // Update order level status: if all items cancelled -> cancelled, else keep as is
    const anyActive = order.items.some(i => i.status !== 'cancelled');
    order.status = anyActive ? order.status : 'cancelled';

    // Update cancellation tracking fields
    if (order.status === 'cancelled') {
      order.cancelledAt = new Date();
      order.cancelledBy = 'hotel';
      order.cancellationReason = 'Cancelled by hotel within 24 hours';
    }

    // Optional: if payment was made online, mark as refund pending/handled
    if (order.paymentMethod === 'online' && order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
      order.refundStatus = 'pending';
      order.refundAmount = originalTotalAmount; // Use original amount
    } else if (order.paymentMethod === 'cod') {
      order.refundStatus = 'not_applicable';
    }

    // Recalculate order totals after cancellation so revenue reflects changes
    recalcOrderTotals(order);
    
    // Restore original amount for email (after recalc sets it to 0)
    const emailTotalAmount = originalTotalAmount;
    console.log('Total amount for email:', emailTotalAmount);

    await order.save();

    // Send cancellation email based on refund policy
    let emailResult = { success: false };
    console.log(`Sending cancellation email for order ${order._id}, payment method: ${order.paymentMethod}, email: ${order.billingInfo?.email}`);
    console.log('Order totalAmount before email:', order.totalAmount);
    console.log('Order object type:', typeof order);
    console.log('Order toObject totalAmount:', order.toObject ? order.toObject().totalAmount : 'No toObject method');
    
    try {
      // Check if cancellation is within policy (24 hours)
      const cancellationCheck = isCancellationAllowed(order, 'hotel');
      console.log('Cancellation check result:', cancellationCheck);
      
      // Create order object with original amount for email
      const orderForEmail = {
        ...order.toObject(),
        totalAmount: emailTotalAmount
      };
      
      if (cancellationCheck.allowed) {
        // Within 24 hours - send confirmation email
        if (order.paymentMethod === 'cod') {
          emailResult = await sendCODCancellationWithin24Hours(orderForEmail);
        } else if (order.paymentMethod === 'online') {
          emailResult = await sendOnlinePaymentCancellationWithin24Hours(orderForEmail);
        }
      } else {
        // After 24 hours - send rejection email (but still cancel for now)
        if (order.paymentMethod === 'cod') {
          emailResult = await sendCODCancellationAfter24Hours(orderForEmail);
        } else if (order.paymentMethod === 'online') {
          emailResult = await sendOnlinePaymentCancellationAfter24Hours(orderForEmail);
        }
      }
      console.log('Email result:', emailResult);
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      emailResult = { success: false, error: emailError.message };
    }

    const populatedOrder = await Order.findById(orderId)
      .populate('items.productId')
      .populate('items.sellerId')
      .populate('hotelId');

    const message = hasUndeliverableItems
      ? 'Order partially cancelled. Delivered items were not affected.'
      : 'Order cancelled successfully';

    return res.status(200).json({ 
      message, 
      order: populatedOrder,
      emailSent: emailResult.success,
      refundInfo: order.paymentMethod === 'online' ? 
        'Refund will be processed according to our policy' : 
        order.paymentMethod === 'cod' ? 'No payment was processed for this COD order' : null
    });
  } catch (err) {
    console.error('Cancel order by hotel error:', err);
    return res.status(500).json({ message: 'Failed to cancel order' });
  }
};

// Helper function to rollback inventory changes
const rollbackInventory = async (processedItems) => {
  for (const item of processedItems) {
    try {
      await Product.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { stock: item.quantity }, // Restore the quantity
          $set: { outOfStock: false } // Reset out of stock status
        }
      );
    } catch (rollbackError) {
      console.error('Rollback failed for item:', item.productId, rollbackError);
    }
  }
};

export const getOrdersByHotel = async (req, res) => {
  const { hotelId } = req.params;

  try {
    console.log('Fetching orders for hotel:', hotelId);
    
    // Get orders with proper population - include paid orders, credit orders, and COD orders
    const orders = await Order.find({ 
      hotelId,
      $or: [
        { paymentStatus: { $in: ['paid', 'refunded'] } },   // Online payments (paid or refunded)
        { paymentMethod: 'credit' },                         // Credit orders (any payment status)
        { paymentMethod: 'cod' },                            // Cash on Delivery orders (any payment status)
        { status: 'cancelled' }                              // Always include cancelled orders
      ]
    })
      .populate('items.productId', 'name brand category price image')
      .populate('items.sellerId', 'name email businessName')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} valid orders (paid/credit/COD) for hotel ${hotelId}`);
    
    // Debug: Log the actual status of orders
    orders.forEach(order => {
      console.log(`Order ${order._id}: status=${order.status}, paymentStatus=${order.paymentStatus}`);
      order.items.forEach((item, index) => {
        console.log(`  Item ${index}: status=${item.status}, product=${item.productId?.name}`);
      });
    });
    
    if (!orders || orders.length === 0) {
      return res.status(200).json([]);
    }
    
    // Split orders by individual items for display
    const splitOrders = [];
    
    orders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          // Skip items with null/undefined productId
          if (!item.productId) {
            console.warn(`Skipping item with null productId in order ${order._id}`);
            return;
          }
          
          splitOrders.push({
            _id: order._id,
            originalOrderId: order._id,
            hotelId: order.hotelId,
            item: {
              productId: item.productId,
              sellerId: item.sellerId,
              quantity: item.quantity || 1,
              price: item.price || 0,
              status: item.status || order.status || 'pending',
              expectedDeliveryDate: item.expectedDeliveryDate || order.expectedDeliveryDate
            },
            status: item.status || order.status || 'pending',
            expectedDeliveryDate: item.expectedDeliveryDate || order.expectedDeliveryDate,
            totalAmount: (item.price || 0) * (item.quantity || 1),
            createdAt: order.createdAt,
            orderedAt: order.createdAt || order.updatedAt,
            billingInfo: order.billingInfo
          });
        });
      }
    });
    
    console.log(`Returning ${splitOrders.length} split order items`);
    res.status(200).json(splitOrders);
  } catch (err) {
    console.error('Get hotel orders error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ 
      message: 'Failed to fetch orders', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export const getOrdersBySeller = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;
    
    // Find all orders that contain items from this seller - include paid orders, credit orders, and COD orders
    const orders = await Order.find({ 
      'items.sellerId': sellerId,
      $or: [
        { paymentStatus: { $in: ['paid', 'refunded'] } },   // Online payments (paid or refunded)
        { paymentMethod: 'credit' },                         // Credit orders (any payment status)
        { paymentMethod: 'cod' },                            // Cash on Delivery orders (any payment status)
        { status: 'cancelled' }                              // Always include cancelled orders
      ]
    })
      .populate('items.productId', 'name brand category price image')
      .populate('hotelId', 'name email')
      .sort({ createdAt: -1 });

    // Split orders by individual items for display (similar to hotel orders)
    const splitSellerOrders = [];
    
    orders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          // Only include items from this seller
          if (item.sellerId.toString() === sellerId.toString()) {
            // Skip items with null/undefined productId
            if (!item.productId) {
              console.warn(`Skipping item with null productId in order ${order._id}`);
              return;
            }
            
            splitSellerOrders.push({
              _id: order._id,
              originalOrderId: order._id,
              hotelId: order.hotelId,
              item: {
                productId: item.productId,
                sellerId: item.sellerId,
                quantity: item.quantity || 1,
                price: item.price || 0,
                status: item.status || order.status || 'pending',
                expectedDeliveryDate: item.expectedDeliveryDate || order.expectedDeliveryDate
              },
              status: item.status || order.status || 'pending',
              expectedDeliveryDate: item.expectedDeliveryDate || order.expectedDeliveryDate,
              totalAmount: (item.price || 0) * (item.quantity || 1),
              createdAt: order.createdAt,
              orderedAt: order.createdAt || order.updatedAt,
              billingInfo: order.billingInfo,
              buyerInfo: {
                name: order.billingInfo?.fullName || order.hotelId?.name || 'Unknown Buyer',
                email: order.billingInfo?.email || order.hotelId?.email || '',
                phone: order.billingInfo?.phone || '',
                address: order.billingInfo?.address || ''
              }
            });
          }
        });
      }
    });

    console.log(`Returning ${splitSellerOrders.length} split seller order items (paid/credit/COD)`);
    res.status(200).json(splitSellerOrders);
  } catch (err) {
    console.error('Get seller orders error:', err);
    res.status(500).json({ message: 'Failed to fetch seller orders' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, expectedDeliveryDate } = req.body;
    const sellerId = req.user.id || req.user._id;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find the order and update only the items belonging to this seller
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status and delivery date for items belonging to this seller
    let updated = false;
    const cancelledItems = []; // Track cancelled items for inventory restoration
    
    order.items.forEach(item => {
      if (item.sellerId.toString() === sellerId.toString()) {
        const previousStatus = item.status;
        item.status = status;
        
        // If order is being cancelled, track for inventory restoration
        if (status === 'cancelled' && previousStatus !== 'cancelled') {
          cancelledItems.push({
            productId: item.productId,
            quantity: item.quantity
          });
        }
        
        if (expectedDeliveryDate) {
          item.expectedDeliveryDate = new Date(expectedDeliveryDate);
        }
        updated = true;
      }
    });

    if (!updated) {
      return res.status(403).json({ message: 'No items found for this seller in the order' });
    }

    // Restore inventory for cancelled items
    if (cancelledItems.length > 0) {
      await restoreInventory(cancelledItems);
    }

    // IMPORTANT: Save original total amount BEFORE recalculating (for email)
    const originalTotalAmount = order.totalAmount;
    
    // Send seller cancellation email if items were cancelled
    let emailResult = { success: false };
    if (cancelledItems.length > 0 && status === 'cancelled') {
      console.log('=== SELLER CANCELLATION EMAIL ===');
      console.log('Order ID:', orderId);
      console.log('Seller ID:', sellerId);
      console.log('Original total amount:', originalTotalAmount);
      console.log('Payment method:', order.paymentMethod);
      console.log('Billing email:', order.billingInfo?.email);
      
      try {
        // Update cancellation tracking fields
        order.cancelledAt = new Date();
        order.cancelledBy = 'seller';
        order.cancellationReason = 'Cancelled by seller due to unforeseen circumstances';
        
        // Update refund status
        if (order.paymentMethod === 'online' && order.paymentStatus === 'paid') {
          order.paymentStatus = 'refunded';
          order.refundStatus = 'pending';
          order.refundAmount = originalTotalAmount;
        } else if (order.paymentMethod === 'cod') {
          order.refundStatus = 'not_applicable';
        }

        // Create order object with original amount for email
        const orderForEmail = {
          ...order.toObject(),
          totalAmount: originalTotalAmount
        };

        // Send appropriate seller cancellation email
        if (order.paymentMethod === 'cod') {
          emailResult = await sendCODSellerCancellation(orderForEmail);
        } else if (order.paymentMethod === 'online') {
          emailResult = await sendOnlinePaymentSellerCancellation(orderForEmail);
        }
        
        console.log('Seller cancellation email result:', emailResult);
      } catch (emailError) {
        console.error('Error sending seller cancellation email:', emailError);
        emailResult = { success: false, error: emailError.message };
      }
    }

    // Recalculate order totals after potential cancellations so revenue reflects changes
    recalcOrderTotals(order);

    await order.save();
    
    const populatedOrder = await Order.findById(orderId)
      .populate('items.productId')
      .populate('items.sellerId')
      .populate('hotelId');

    res.status(200).json({ 
      message: 'Order updated successfully', 
      order: populatedOrder,
      emailSent: emailResult.success,
      cancellationEmail: cancelledItems.length > 0 && status === 'cancelled' ? 
        (emailResult.success ? 'Cancellation email sent to customer' : 'Email sending failed') : null
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// Helper function to restore inventory when orders are cancelled
async function restoreInventory(cancelledItems) {
  for (const item of cancelledItems) {
    try {
      await Product.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { stock: item.quantity }, // Restore the quantity
          $set: { outOfStock: false } // Reset out of stock status
        }
      );
      console.log(`Restored ${item.quantity} units for product ${item.productId}`);
    } catch (restoreError) {
      console.error('Failed to restore inventory for item:', item.productId, restoreError);
    }
  }
}

// Recalculate order-level totals (subtotal, gstAmount, totalAmount)
// Excludes items with status 'cancelled' from totals to ensure revenue reflects cancellations
function recalcOrderTotals(orderDoc) {
  try {
    const GST_RATE = 0.05; // keep in sync with placeOrder
    const activeItems = (orderDoc.items || []).filter(i => i.status !== 'cancelled');
    const newSubtotal = activeItems.reduce((sum, i) => sum + (Number(i.price || 0) * Number(i.quantity || 0)), 0);
    const newGst = Number((newSubtotal * GST_RATE).toFixed(2));
    const newTotal = Number((newSubtotal + newGst).toFixed(2));

    orderDoc.subtotal = newSubtotal;
    orderDoc.gstAmount = newGst;
    // keep backward compatibility
    orderDoc.tax = newGst;
    orderDoc.totalAmount = newTotal;

    // If everything is cancelled, mark order as cancelled
    if (activeItems.length === 0) {
      orderDoc.status = 'cancelled';
    }
  } catch (e) {
    console.error('Failed to recalc order totals:', e);
  }
}

// Get a single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('hotelId')
      .populate({
        path: 'items.productId',
        model: 'Product'
      })
      .populate({
        path: 'items.sellerId',
        model: 'User'
      });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      order: order
    });
    
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching order',
      error: error.message 
    });
  }
};
