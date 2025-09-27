// pages/RefundPolicy.jsx
import React, { useState, useEffect } from 'react';
import { Clock, CreditCard, Truck, AlertCircle, CheckCircle, XCircle, Mail, Phone } from 'lucide-react';

const RefundPolicy = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefundPolicy();
  }, []);

  const fetchRefundPolicy = async () => {
    try {
      const response = await fetch('/api/refund/policy');
      const data = await response.json();
      
      if (data.success) {
        setPolicy(data.policy);
      }
    } catch (error) {
      console.error('Error fetching refund policy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Refund & Cancellation Policy</h1>
              <p className="text-gray-600 mt-1">Understand your rights and our commitment to fair policies</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <Clock className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">24-Hour Window</h3>
              </div>
              <p className="text-blue-700">
                All orders can be cancelled within 24 hours of placement, regardless of payment method.
              </p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-green-900">Fair Refunds</h3>
              </div>
              <p className="text-green-700">
                We ensure fair and timely refunds based on payment method and cancellation circumstances.
              </p>
            </div>
          </div>
        </div>

        {/* Cash on Delivery Policy */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <Truck className="w-8 h-8 text-orange-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Cash on Delivery Orders</h2>
          </div>

          <div className="space-y-6">
            {/* Hotel Cancellation */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Cancellation</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-900">Within 24 Hours</h4>
                  </div>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Cancellation allowed</li>
                    <li>• No payment processed</li>
                    <li>• No refund needed</li>
                    <li>• Confirmation email sent</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-900">After 24 Hours</h4>
                  </div>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Cancellation not allowed</li>
                    <li>• Order being processed</li>
                    <li>• Delivery as scheduled</li>
                    <li>• Notification email sent</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Seller Cancellation */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Cancellation</h3>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                  <h4 className="font-medium text-orange-900">Any Time</h4>
                </div>
                <ul className="text-orange-700 text-sm space-y-1">
                  <li>• Cancellation allowed anytime</li>
                  <li>• No payment processed</li>
                  <li>• Sincere apology email sent</li>
                  <li>• 10% discount on next order</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Online Payment Policy */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Online Payment Orders</h2>
          </div>

          <div className="space-y-6">
            {/* Hotel Cancellation */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Cancellation</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-900">Within 24 Hours</h4>
                  </div>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Cancellation allowed</li>
                    <li>• Full refund processed</li>
                    <li>• 3 business days timeline</li>
                    <li>• Refund to original method</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-900">After 24 Hours</h4>
                  </div>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Cancellation not allowed</li>
                    <li>• Payment already processed</li>
                    <li>• Order being prepared</li>
                    <li>• Delivery as scheduled</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Seller Cancellation */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Cancellation</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-900">Any Time</h4>
                </div>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Cancellation allowed anytime</li>
                  <li>• Immediate refund processing</li>
                  <li>• 24 hours timeline</li>
                  <li>• 15% discount on next order</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* General Terms */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">General Terms & Conditions</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Processing</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Refunds processed to original payment method only</li>
                <li>• Business days: Monday to Friday (excluding holidays)</li>
                <li>• Bank processing time may vary (3-7 days)</li>
                <li>• Email confirmation sent upon refund initiation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Notes</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Cancellation window starts from order placement</li>
                <li>• Time calculated in Indian Standard Time (IST)</li>
                <li>• Partial cancellations not supported</li>
                <li>• Policy subject to change with notice</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-blue-100 mb-6">
            Our customer support team is here to help with any questions about cancellations or refunds.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-3" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-blue-100">support@hot-del.com</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-3" />
              <div>
                <p className="font-medium">24/7 Support</p>
                <p className="text-blue-100">Available for all users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
