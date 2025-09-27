// pages/TestCancellation.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const TestCancellation = () => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  const testEmail = async () => {
    try {
      setTestEmailLoading(true);
      const response = await fetch('/api/refund/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'sauravgharge10@gmail.com'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Test email sent successfully! Message ID: ${data.messageId}`);
      } else {
        toast.error(`Failed to send test email: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setTestEmailLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        return;
      }

      // First check eligibility
      const checkResponse = await fetch(`/api/refund/check/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const checkData = await checkResponse.json();
      console.log('Eligibility check:', checkData);

      if (!checkData.success) {
        toast.error(checkData.message);
        return;
      }

      if (!checkData.eligible) {
        toast.error(`Cannot cancel: ${checkData.reason}`);
        return;
      }

      // Proceed with cancellation
      const cancelResponse = await fetch(`/api/refund/cancel/hotel/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const cancelData = await cancelResponse.json();
      console.log('Cancellation result:', cancelData);
      
      if (cancelData.success) {
        toast.success('Order cancelled successfully!');
        if (cancelData.emailSent) {
          toast('Cancellation email sent!', { icon: '📧' });
        } else {
          toast.error('Order cancelled but email failed to send');
        }
      } else {
        toast.error(cancelData.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Cancellation System</h1>
          
          {/* Test Email Section */}
          <div className="mb-8 p-6 bg-blue-50 rounded-xl">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Test Email System</h2>
            <p className="text-blue-700 mb-4">
              First, let's verify that the email system is working correctly.
            </p>
            <button
              onClick={testEmail}
              disabled={testEmailLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {testEmailLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Test Email...
                </>
              ) : (
                'Send Test Email'
              )}
            </button>
          </div>

          {/* Order Cancellation Section */}
          <div className="p-6 bg-red-50 rounded-xl">
            <h2 className="text-xl font-semibold text-red-900 mb-4">Test Order Cancellation</h2>
            <p className="text-red-700 mb-4">
              Enter an order ID to test the cancellation and email system.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter order ID (e.g., 68d8024847ad2d9b16d9dcfd)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={cancelOrder}
              disabled={loading || !orderId.trim()}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling Order...
                </>
              ) : (
                'Cancel Order & Send Email'
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions:</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>First, test the email system by clicking "Send Test Email"</li>
              <li>Check your email (sauravgharge10@gmail.com) for the test message</li>
              <li>Find a recent order ID from your orders</li>
              <li>Enter the order ID and click "Cancel Order & Send Email"</li>
              <li>Check the browser console and server logs for detailed information</li>
              <li>Check your email for the cancellation notification</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCancellation;
