// components/OrderCancellation.jsx
import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderCancellation = ({ order, isOpen, onClose, onCancellationSuccess, userRole }) => {
  const [loading, setLoading] = useState(false);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  useEffect(() => {
    if (isOpen && order) {
      checkCancellationEligibility();
    }
  }, [isOpen, order]);

  const checkCancellationEligibility = async () => {
    try {
      setCheckingEligibility(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/refund/check/${order._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setEligibilityData(data);
      } else {
        toast.error(data.message || 'Failed to check cancellation eligibility');
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      toast.error('Failed to check cancellation eligibility');
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleCancellation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const endpoint = userRole === 'seller' 
        ? `/api/refund/cancel/seller/${order._id}`
        : `/api/refund/cancel/hotel/${order._id}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Order cancelled successfully');
        if (data.emailSent) {
          toast('Cancellation confirmation email sent', { icon: '📧' });
        }
        onCancellationSuccess(data.order);
        onClose();
      } else {
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = () => {
    if (!eligibilityData?.hoursSinceOrder) return null;
    
    const hoursRemaining = 24 - eligibilityData.hoursSinceOrder;
    if (hoursRemaining <= 0) return null;
    
    const hours = Math.floor(hoursRemaining);
    const minutes = Math.floor((hoursRemaining - hours) * 60);
    
    return `${hours}h ${minutes}m`;
  };

  const getRefundInfo = () => {
    if (!order) return null;
    
    const paymentMethod = order.paymentMethod;
    const cancelledBy = userRole;
    
    if (paymentMethod === 'cod') {
      if (cancelledBy === 'seller') {
        return {
          type: 'compensation',
          message: 'No payment was processed. You will receive a 10% discount on your next order.',
          timeline: 'Immediate',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />
        };
      } else {
        return {
          type: 'no_refund',
          message: 'No payment was processed for this Cash on Delivery order.',
          timeline: 'N/A',
          icon: <Info className="w-5 h-5 text-blue-500" />
        };
      }
    } else if (paymentMethod === 'online') {
      if (cancelledBy === 'seller') {
        return {
          type: 'immediate_refund',
          message: `Full refund of ₹${order.totalAmount} will be processed immediately. You will also receive a 15% discount on your next order.`,
          timeline: 'Within 24 hours',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />
        };
      } else {
        return {
          type: 'standard_refund',
          message: `Full refund of ₹${order.totalAmount} will be processed to your original payment method.`,
          timeline: 'Within 3 business days',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />
        };
      }
    }
    
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Cancel Order</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {checkingEligibility ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Checking cancellation eligibility...</span>
            </div>
          ) : (
            <>
              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <span className="ml-2 font-medium">{order._id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="ml-2 font-medium">₹{order.totalAmount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="ml-2 font-medium capitalize">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Order Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(order.orderedAt || order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Eligibility Status */}
              {eligibilityData && (
                <div className={`rounded-xl p-4 mb-6 ${
                  eligibilityData.eligible 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center mb-2">
                    {eligibilityData.eligible ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <h3 className={`font-semibold ${
                      eligibilityData.eligible ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {eligibilityData.eligible ? 'Cancellation Allowed' : 'Cancellation Not Allowed'}
                    </h3>
                  </div>
                  
                  <p className={`text-sm mb-2 ${
                    eligibilityData.eligible ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {eligibilityData.eligible 
                      ? 'This order can be cancelled according to our refund policy.'
                      : 'This order cannot be cancelled as the 24-hour cancellation window has expired.'
                    }
                  </p>
                  
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>
                      Time since order: {Math.round(eligibilityData.hoursSinceOrder)} hours
                      {eligibilityData.eligible && getTimeRemaining() && (
                        <span className="ml-2 text-orange-600 font-medium">
                          ({getTimeRemaining()} remaining)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Refund Information */}
              {eligibilityData?.eligible && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Refund Information
                  </h3>
                  {(() => {
                    const refundInfo = getRefundInfo();
                    return refundInfo ? (
                      <div>
                        <div className="flex items-start mb-2">
                          {refundInfo.icon}
                          <p className="text-blue-700 text-sm ml-2">
                            {refundInfo.message}
                          </p>
                        </div>
                        <p className="text-blue-600 text-sm">
                          <strong>Timeline:</strong> {refundInfo.timeline}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Warning for non-eligible orders */}
              {eligibilityData && !eligibilityData.eligible && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                    <h3 className="font-semibold text-orange-900">Cancellation Policy</h3>
                  </div>
                  <p className="text-orange-700 text-sm mb-2">
                    Orders can only be cancelled within 24 hours of placement. After this time, 
                    orders are processed and prepared for delivery.
                  </p>
                  <p className="text-orange-600 text-sm">
                    Your order will be delivered as scheduled. If you have any concerns, 
                    please contact our customer support.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                
                {eligibilityData?.eligible && (
                  <button
                    onClick={handleCancellation}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Order'
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCancellation;
