import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft, CreditCard, Phone, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PaymentFailure = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const error = searchParams.get('error') || 'Payment failed';
  const reason = searchParams.get('reason') || 'Unknown error occurred';

  const handleRetryPayment = async () => {
    try {
      console.log('=== Retry Payment Debug ===');
      console.log('Button clicked');
      console.log('User from context:', user);
      console.log('User from localStorage:', JSON.parse(localStorage.getItem('user') || 'null'));
      
      // Check if user is authenticated
      if (!user) {
        console.log('No user found, redirecting to hotel login');
        toast.error('Please login to retry payment');
        navigate('/hotel-login');
        return;
      }
      
      // Check if user has hotel role
      if (user.role !== 'hotel') {
        console.log('User role is not hotel:', user.role);
        toast.error('Only hotel users can make payments');
        return;
      }
      
      console.log('User is authenticated and has hotel role');
      console.log('Attempting to restore failed order items...');
      
      // First, try to get the failed order details to restore items
      try {
        if (orderId) {
          console.log('Fetching failed order details for orderId:', orderId);
          
          // Get the failed order details
          const orderResponse = await fetch(`http://localhost:3000/api/orders/single/${orderId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            const order = orderData.order || orderData;
            
            console.log('Failed order found:', order);
            console.log('Order items:', order?.items);
            
            if (order && order.items && order.items.length > 0) {
              // Restore the failed order items to cart
              console.log('Restoring', order.items.length, 'items to cart');
              
              let restoredCount = 0;
              
              // Add each item individually to cart
              for (const item of order.items) {
                try {
                  const productId = item.productId?._id || item.productId;
                  console.log('Adding item to cart:', productId, 'quantity:', item.quantity);
                  
                  // Add each quantity one by one (since cart API adds +1 each time)
                  for (let i = 0; i < item.quantity; i++) {
                    const cartResponse = await fetch(`http://localhost:3000/api/cart/add`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({
                        hotelId: user._id,
                        productId: productId
                      })
                    });
                    
                    if (!cartResponse.ok) {
                      console.error('Failed to add item to cart:', await cartResponse.text());
                      break;
                    }
                  }
                  restoredCount++;
                } catch (itemError) {
                  console.error('Error adding item to cart:', itemError);
                }
              }
              
              if (restoredCount > 0) {
                console.log('Items restored to cart successfully:', restoredCount);
                toast('Restoring your order items and redirecting to billing...', {
                  icon: '🔄',
                  duration: 3000
                });
                
                setTimeout(() => {
                  console.log('Items restored, navigating to /billing');
                  navigate('/billing');
                }, 1000);
                return;
              } else {
                console.error('Failed to restore any items to cart');
              }
            }
          } else {
            console.log('Order response not OK:', orderResponse.status, await orderResponse.text());
          }
        } else {
          console.log('No orderId provided for restoration');
        }
        
        // If we couldn't restore the order, check current cart status
        console.log('Could not restore order, checking current cart...');
        const cartResponse = await fetch(`http://localhost:3000/api/cart/${user._id}`);
        const cartData = await cartResponse.json();
        const cartItems = cartData?.items || cartData || [];
        
        console.log('Current cart items:', cartItems.length);
        
        if (cartItems.length > 0) {
          // User has items, go to billing
          toast('Redirecting to billing page to retry payment...', {
            icon: '🔄',
            duration: 2000
          });
          
          setTimeout(() => {
            console.log('Cart has items, navigating to /billing');
            navigate('/billing');
          }, 500);
        } else {
          // No items and couldn't restore, go to cart
          toast('Unable to restore order items. Please add items to cart again.', {
            icon: '⚠️',
            duration: 4000
          });
          
          setTimeout(() => {
            console.log('No items to restore, navigating to /cart');
            navigate('/cart');
          }, 1000);
        }
        
      } catch (error) {
        console.error('Error restoring order items:', error);
        // Fallback to cart page
        toast('Error restoring order. Redirecting to cart...', {
          icon: '❌',
          duration: 3000
        });
        
        setTimeout(() => {
          console.log('Error occurred, navigating to /cart as fallback');
          navigate('/cart');
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error in handleRetryPayment:', error);
      toast.error('Failed to redirect to billing page');
    }
  };

  const commonIssues = [
    {
      issue: 'Insufficient Balance',
      solution: 'Please check your account balance and try again'
    },
    {
      issue: 'Card Declined',
      solution: 'Contact your bank or try a different payment method'
    },
    {
      issue: 'Network Error',
      solution: 'Check your internet connection and retry'
    },
    {
      issue: 'Payment Timeout',
      solution: 'The payment session expired, please try again'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Failure Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          
          <p className="text-xl text-gray-600 mb-4">
            We couldn't process your payment. Please try again.
          </p>
          
          <div className="inline-flex items-center px-4 py-2 bg-red-100 rounded-full text-red-800 text-sm font-medium">
            Error: {error}
          </div>
        </div>

        {/* Error Details Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Payment Details</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Order ID</label>
                <p className="text-lg font-semibold text-gray-900">#{orderId?.slice(-8)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Error Reason</label>
                <p className="text-gray-900">{reason}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Time</label>
                <p className="text-gray-900">
                  {new Date().toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleRetryPayment}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Retry Payment
          </button>
          
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </button>
        </div>

        {/* Common Issues */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Payment Issues</h3>
          <div className="space-y-4">
            {commonIssues.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-900">{item.issue}</h4>
                <p className="text-gray-600 text-sm mt-1">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Payment Methods */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Try Alternative Payment Methods</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
              <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Different Card</h4>
                <p className="text-sm text-gray-600">Try another credit/debit card</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold text-sm">UPI</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">UPI Payment</h4>
                <p className="text-sm text-gray-600">Pay with Google Pay, PhonePe, etc.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you continue to face issues, please contact our support team:
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-gray-900">+91 98765 43210</span>
            </div>
            
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-gray-900">support@hotdel.com</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Support hours: Monday to Friday, 9 AM to 6 PM IST
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
