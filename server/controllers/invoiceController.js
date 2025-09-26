// controllers/invoiceController.js
import Order from '../models/Order.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('Generating invoice for order:', orderId);
    console.log('User requesting invoice:', req.user?._id);
    
    // Fetch order details
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
    
    console.log('Order found:', order ? 'Yes' : 'No');
    if (order) {
      console.log('Order hotel ID:', order.hotelId?._id);
      console.log('Order items count:', order.items?.length);
    }
    
    if (!order) {
      console.log('Order not found in database');
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns this order
    if (order.hotelId._id.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access - Order belongs to different user');
      return res.status(403).json({ message: 'Unauthorized access to order' });
    }
    
    console.log('Starting PDF generation...');
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.invoiceNumber || order._id}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Handle PDF generation errors
    doc.on('error', (err) => {
      console.error('PDF generation error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error generating PDF' });
      }
    });
    
    // Add company header
    doc.fontSize(20)
       .fillColor('#2563eb')
       .text('HOT-DEL', 50, 50)
       .fontSize(10)
       .fillColor('#666666')
       .text('B2B Food Supply Platform', 50, 75)
       .text('Email: support@hot-del.com', 50, 90)
       .text('Phone: +91 98765 43210', 50, 105);
    
    // Add invoice title and number
    doc.fontSize(24)
       .fillColor('#000000')
       .text('INVOICE', 400, 50)
       .fontSize(12)
       .text(`Invoice #: ${order.invoiceNumber || `INV-${order._id.toString().slice(-8)}`}`, 400, 80)
       .text(`Date: ${new Date(order.paidAt || order.createdAt).toLocaleDateString('en-IN')}`, 400, 95)
       .text(`Order ID: #${order._id.toString().slice(-8)}`, 400, 110);
    
    // Add horizontal line
    doc.moveTo(50, 140)
       .lineTo(550, 140)
       .stroke('#cccccc');
    
    // Bill To section
    doc.fontSize(14)
       .fillColor('#000000')
       .text('Bill To:', 50, 160)
       .fontSize(12)
       .text(order.billingInfo?.fullName || order.hotelId?.name || 'N/A', 50, 180)
       .text(order.billingInfo?.email || order.hotelId?.email || '', 50, 195)
       .text(order.billingInfo?.phone || order.hotelId?.phone || '', 50, 210);
    
    // Address
    if (order.billingInfo?.address) {
      const address = order.billingInfo.address;
      doc.text(`${address.street}`, 50, 225)
         .text(`${address.city}, ${address.state} ${address.zipCode}`, 50, 240)
         .text(address.country || 'India', 50, 255);
    }
    
    // Payment Info
    doc.fontSize(14)
       .text('Payment Information:', 350, 160)
       .fontSize(12)
       .text(`Method: ${order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}`, 350, 180)
       .text(`Status: ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}`, 350, 195);
    
    if (order.razorpayPaymentId) {
      doc.text(`Payment ID: ${order.razorpayPaymentId}`, 350, 210);
    }
    
    // Items table header
    const tableTop = 300;
    doc.fontSize(12)
       .fillColor('#000000');
    
    // Table headers
    doc.rect(50, tableTop, 500, 25)
       .fill('#f3f4f6')
       .fillColor('#000000')
       .text('Item', 60, tableTop + 8)
       .text('Qty', 250, tableTop + 8)
       .text('Rate', 300, tableTop + 8)
       .text('Amount', 450, tableTop + 8);
    
    // Table items
    let yPosition = tableTop + 35;
    let subtotal = 0;
    
    // Safely handle order items
    const items = order.items || [];
    console.log('Processing', items.length, 'items for invoice');
    
    items.forEach((item, index) => {
      try {
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        const itemTotal = quantity * price;
        subtotal += itemTotal;
        
        // Alternate row colors
        if (index % 2 === 0) {
          doc.rect(50, yPosition - 5, 500, 25)
             .fill('#f9fafb')
             .fillColor('#000000');
        }
        
        const productName = item.productId?.name || `Product ${index + 1}`;
        
        doc.text(productName, 60, yPosition)
           .text(quantity.toString(), 250, yPosition)
           .text(`₹${price.toFixed(2)}`, 300, yPosition)
           .text(`₹${itemTotal.toFixed(2)}`, 450, yPosition);
        
        yPosition += 25;
      } catch (itemError) {
        console.error('Error processing item:', itemError);
        // Continue with next item
      }
    });
    
    // Totals section
    const totalsTop = yPosition + 20;
    
    // Subtotal
    doc.text('Subtotal:', 350, totalsTop)
       .text(`₹${order.subtotal?.toFixed(2) || subtotal.toFixed(2)}`, 450, totalsTop);
    
    // GST
    const gstAmount = order.gstAmount || order.tax || (subtotal * 0.05);
    doc.text('GST (5%):', 350, totalsTop + 20)
       .text(`₹${gstAmount.toFixed(2)}`, 450, totalsTop + 20);
    
    // Total
    const totalAmount = order.totalAmount || (subtotal + gstAmount);
    doc.fontSize(14)
       .fillColor('#000000')
       .text('Total Amount:', 350, totalsTop + 45)
       .text(`₹${totalAmount.toFixed(2)}`, 450, totalsTop + 45);
    
    // Add line above total
    doc.moveTo(350, totalsTop + 40)
       .lineTo(520, totalsTop + 40)
       .stroke('#000000');
    
    // Footer
    const footerTop = totalsTop + 100;
    doc.fontSize(10)
       .fillColor('#666666')
       .text('Thank you for your business!', 50, footerTop)
       .text('This is a computer generated invoice.', 50, footerTop + 15)
       .text('For any queries, contact us at support@hot-del.com', 50, footerTop + 30);
    
    // Terms and conditions
    doc.text('Terms & Conditions:', 50, footerTop + 60)
       .fontSize(8)
       .text('1. Payment is due within 30 days of invoice date.', 50, footerTop + 75)
       .text('2. Late payments may incur additional charges.', 50, footerTop + 85)
       .text('3. All disputes must be reported within 7 days.', 50, footerTop + 95);
    
    // Finalize PDF
    console.log('Finalizing PDF...');
    doc.end();
    
  } catch (error) {
    console.error('Error generating invoice:', error);
    console.error('Error stack:', error.stack);
    
    // Make sure we don't send response twice
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate invoice',
        error: error.message 
      });
    }
  }
};
