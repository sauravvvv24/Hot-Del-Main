import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, Eye, ShoppingBag, ArrowRight, Calendar, CreditCard, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get('payment_id');
  const creditTerms = searchParams.get('credit') === 'true';
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching order details for orderId:', orderId);
      
      const response = await fetch(`http://localhost:3000/api/orders/single/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('Order API response:', data);
      
      if (data.success && data.order) {
        setOrderDetails(data.order);
        console.log('Order details set:', data.order);
      } else if (data) {
        // Sometimes the order data might be directly in the response
        setOrderDetails(data);
        console.log('Order details set from direct response:', data);
      } else {
        console.log('No order data found in response');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const downloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/invoice/download/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }
      
      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `invoice-${orderId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Convert response to blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully!');
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {creditTerms ? 'Order Placed Successfully!' : 'Payment Successful!'}
          </h1>
          
          <p className="text-xl text-gray-600 mb-4">
            {creditTerms 
              ? 'Your order has been placed with 30-day credit terms'
              : 'Thank you for your payment. Your order is confirmed!'
            }
          </p>
          
          {paymentId && (
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment ID: {paymentId}
            </div>
          )}
        </div>

        {/* Order Details Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Order Details</h2>
          </div>
          
          <div className="p-6">
            {orderDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order ID</label>
                    <p className="text-lg font-semibold text-gray-900">#{(orderDetails._id || orderId)?.slice(-8)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order Date</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(orderDetails.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <p className="text-gray-900 flex items-center">
                      {orderDetails.paymentMethod === 'credit' ? (
                        <>
                          <Building2 className="w-4 h-4 mr-2" />
                          Credit Terms (30 days)
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Online Payment
                        </>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      orderDetails.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : orderDetails.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {orderDetails.paymentStatus === 'paid' ? 'Paid' : 
                       orderDetails.paymentStatus === 'pending' ? 'Pending' : 
                       orderDetails.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Items</label>
                    <p className="text-lg font-semibold text-gray-900">{orderDetails.items?.length || 0} items</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hotel Name</label>
                    <p className="text-gray-900">{orderDetails.hotelId?.name || orderDetails.billingInfo?.fullName || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order Status</label>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {orderDetails.status}
                    </span>
                  </div>
                  
                  {orderDetails.invoiceNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                      <p className="text-gray-900 font-mono">{orderDetails.invoiceNumber}</p>
                    </div>
                  )}
                  
                  {orderDetails.dueDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Due Date</label>
                      <p className="text-gray-900">
                        {new Date(orderDetails.dueDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Fallback when order details are not available
              <div className="text-center py-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order ID</label>
                    <p className="text-lg font-semibold text-gray-900">#{orderId?.slice(-8) || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order Date</label>
                    <p className="text-gray-900 flex items-center justify-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date().toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <p className="text-gray-900 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Online Payment
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Status</label>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  </div>
                  
                  {paymentId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment ID</label>
                      <p className="text-gray-900 font-mono text-sm">{paymentId}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Order details are being processed. You can view complete order information in the Orders section.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        {orderDetails && orderDetails.items && orderDetails.items.length > 0 && (
          <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.productId?.name || `Product ${index + 1}`}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ₹{item.price?.toFixed(2)}
                    </p>
                    {item.productId?.category && (
                      <p className="text-xs text-gray-500">Category: {item.productId.category}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amount Breakdown */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount Breakdown</h3>
          {orderDetails ? (
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{orderDetails.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (5%)</span>
                <span>₹{(orderDetails.gstAmount || orderDetails.tax || 0).toFixed(2)}</span>
              </div>
              {orderDetails.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{orderDetails.discountAmount?.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{orderDetails.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Payment Status</span>
                  <span className="text-green-600 font-semibold">Successful</span>
                </div>
                {paymentId && (
                  <div className="flex justify-between text-gray-600">
                    <span>Transaction ID</span>
                    <span className="font-mono text-sm">{paymentId}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <p className="text-gray-600 text-sm">
                    Amount details will be available in your order history
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Eye className="w-5 h-5 mr-2" />
            View All Orders
          </button>
          
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-lg"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Continue Shopping
          </button>
          
          {orderDetails?.invoiceNumber && (
            <button
              onClick={downloadInvoice}
              disabled={downloadingInvoice}
              className="inline-flex items-center justify-center px-6 py-3 border border-green-300 text-base font-medium rounded-xl text-green-700 bg-green-50 hover:bg-green-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className={`w-5 h-5 mr-2 ${downloadingInvoice ? 'animate-spin' : ''}`} />
              {downloadingInvoice ? 'Generating...' : 'Download Invoice'}
            </button>
          )}
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">What happens next?</h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start">
              <ArrowRight className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>You will receive an order confirmation email shortly</span>
            </div>
            <div className="flex items-start">
              <ArrowRight className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>Our sellers will prepare your items for delivery</span>
            </div>
            <div className="flex items-start">
              <ArrowRight className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>You can track your order status in the Orders section</span>
            </div>
            {creditTerms && (
              <div className="flex items-start">
                <ArrowRight className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <span>Payment is due within 30 days as per credit terms</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
