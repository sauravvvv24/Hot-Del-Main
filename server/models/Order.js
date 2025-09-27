// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
        default: 'pending'
      },
      expectedDeliveryDate: {
        type: Date,
        default: null
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  expectedDeliveryDate: {
    type: Date,
    default: null
  },
  billingInfo: {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      zipCode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      }
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'credit'],
    default: 'cod'
  },
  
  // Payment Status and Details
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  // Razorpay Integration Fields
  razorpayOrderId: {
    type: String,
    default: null
  },
  
  razorpayPaymentId: {
    type: String,
    default: null
  },
  
  razorpaySignature: {
    type: String,
    default: null
  },
  
  // Payment Timestamps
  paidAt: {
    type: Date,
    default: null
  },
  
  // Invoice Details
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  gstNumber: {
    type: String,
    default: null
  },
  
  // Payment Breakdown
  gstAmount: {
    type: Number,
    default: 0
  },
  
  discountAmount: {
    type: Number,
    default: 0
  },
  
  // Business Payment Terms
  creditTerms: {
    type: Number, // Days
    default: null
  },
  
  dueDate: {
    type: Date,
    default: null
  },
  
  orderedAt: {
    type: Date,
    default: Date.now
  },
  
  // Cancellation Details
  cancelledAt: {
    type: Date,
    default: null
  },
  
  cancelledBy: {
    type: String,
    enum: ['hotel', 'seller', 'admin'],
    default: null
  },
  
  cancellationReason: {
    type: String,
    default: null
  },
  
  refundStatus: {
    type: String,
    enum: ['not_applicable', 'pending', 'processed', 'failed'],
    default: 'not_applicable'
  },
  
  refundAmount: {
    type: Number,
    default: 0
  },
  
  refundProcessedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);
