import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Smartphone, X, CheckCircle } from 'lucide-react';
import MockRazorpay from './MockRazorpay';

const PaymentModal = ({ isOpen, onClose, order, onSuccess, onFailure }) => {
  const { token } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [showMockRazorpay, setShowMockRazorpay] = useState(false);

  const paymentMethods = [
    {
      id: 'online',
      name: 'Pay Online',
      description: 'Credit/Debit Card, UPI, Net Banking',
      icon: CreditCard,
      color: 'blue',
      instant: true
    }
  ];

  const handlePayment = async () => {
    // For demo purposes, show mock Razorpay instead of real integration
    setShowMockRazorpay(true);
  };

  const handleMockPaymentSuccess = async (paymentData) => {
    try {
      // Verify mock payment with backend
      const response = await fetch('http://localhost:3000/api/payment/mock/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order._id,
          paymentId: paymentData.paymentId,
          method: paymentData.method,
          signature: paymentData.signature
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowMockRazorpay(false);
        onSuccess(data);
      } else {
        setShowMockRazorpay(false);
        onFailure(data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Mock payment verification error:', error);
      setShowMockRazorpay(false);
      onFailure('Payment verification failed');
    }
  };

  const handleMockPaymentFailure = (error) => {
    setShowMockRazorpay(false);
    onFailure(error);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">#{order._id?.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Items:</span>
              <span className="font-medium">{order.items?.length || 0} items</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{order.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST (5%):</span>
              <span className="font-medium">₹{order.gstAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total:</span>
              <span>₹{order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <label
                  key={method.id}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? `border-${method.color}-500 bg-${method.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-2 rounded-lg mr-4 ${
                    paymentMethod === method.id 
                      ? `bg-${method.color}-100 text-${method.color}-600` 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{method.name}</span>
                      {method.instant && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Instant
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  </div>
                  {paymentMethod === method.id && (
                    <CheckCircle className={`w-5 h-5 text-${method.color}-600`} />
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Payment Button */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handlePayment}
            className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            Pay ₹{order.totalAmount?.toFixed(2)}
          </button>

          <div className="flex items-center justify-center mt-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Smartphone className="w-4 h-4 mr-1" />
              <span>UPI, Cards, Net Banking supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Razorpay Payment Gateway */}
      <MockRazorpay
        isOpen={showMockRazorpay}
        onClose={() => setShowMockRazorpay(false)}
        orderData={order}
        onSuccess={handleMockPaymentSuccess}
        onFailure={handleMockPaymentFailure}
      />
    </div>
  );
};

export default PaymentModal;
