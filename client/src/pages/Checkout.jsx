import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import PaymentModal from '../components/PaymentModal';

const Checkout = () => {
  const { cartItems } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotals = () => {
    const subtotal = getTotal();
    const gstAmount = subtotal * 0.18; // 18% GST
    const total = subtotal + gstAmount;
    
    return { subtotal, gstAmount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to place an order.');
      toast.error('Please login to place an order.');
      return;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      toast.error('Your cart is empty.');
      return;
    }
    if (!address.street || !address.city || !address.state || !address.zip || !address.country) {
      setError('Please fill in all address fields.');
      toast.error('Please fill in all address fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { subtotal, gstAmount, total } = calculateTotals();
      
      // Create order first
      const res = await axios.post('http://localhost:3000/api/orders/place', {
        hotelId: user._id,
        address,
        items: cartItems.map(item => ({
          productId: item.productId || item._id,
          sellerId: item.sellerId || item.seller,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        gstAmount,
        totalAmount: total,
        paymentMethod: 'online', // Default to online, can be changed in payment modal
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data.success) {
        // Order created successfully, now show payment modal
        const orderData = {
          _id: res.data.orderId,
          items: cartItems,
          subtotal,
          gstAmount,
          totalAmount: total
        };
        
        setCurrentOrder(orderData);
        setShowPaymentModal(true);
      } else {
        throw new Error(res.data.message || 'Failed to create order');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPaymentModal(false);
    toast.success('Payment successful!');
    
    // Navigate to success page with payment details
    const params = new URLSearchParams({
      payment_id: paymentData.paymentId || '',
      credit: paymentData.creditTerms ? 'true' : 'false'
    });
    
    navigate(`/payment-success/${currentOrder._id}?${params.toString()}`);
  };

  const handlePaymentFailure = (error) => {
    setShowPaymentModal(false);
    toast.error('Payment failed: ' + error);
    
    // Navigate to failure page
    const params = new URLSearchParams({
      error: 'Payment Failed',
      reason: error
    });
    
    navigate(`/payment-failure/${currentOrder._id}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Checkout</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input type="text" name="street" value={address.street} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" name="city" value={address.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input type="text" name="state" value={address.state} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input type="text" name="zip" value={address.zip} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input type="text" name="country" value={address.country} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <ul className="divide-y divide-gray-200 mb-4">
              {cartItems.map((item) => (
                <li key={item.productId || item._id} className="py-3 flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="font-medium">{item.productName || item.name}</span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            
            {/* Enhanced Total Breakdown */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₹{calculateTotals().subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (18%)</span>
                <span>₹{calculateTotals().gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2">
                <span>Total Amount</span>
                <span>₹{calculateTotals().total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-70 mt-4 text-lg font-semibold">
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && currentOrder && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          order={currentOrder}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </div>
  );
};

export default Checkout;