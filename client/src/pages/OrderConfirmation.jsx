import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getOrderById } from '../api/order';

const OrderConfirmation = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || 'N/A';
  const orderDetails = location.state?.orderDetails;
  const [order, setOrder] = useState(orderDetails || null);
  const [loading, setLoading] = useState(!orderDetails);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      // If we already have order details from navigation state, don't fetch
      if (orderDetails) {
        setLoading(false);
        return;
      }
      
      if (!orderId || orderId === 'N/A') {
        setLoading(false);
        setError('No order ID found.');
        return;
      }
      
      try {
        const res = await getOrderById(orderId);
        setOrder(res.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, orderDetails]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-green-700">Order Placed Successfully!</h2>
        <div className="text-lg font-semibold text-gray-800 mb-2">Order ID: <span className="text-blue-600">{orderId}</span></div>
        {loading ? (
          <div className="text-gray-500 mt-4">Loading order details...</div>
        ) : error ? (
          <div className="text-red-600 mt-4">{error}</div>
        ) : order ? (
          <div className="mt-6 text-left">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <ul className="divide-y divide-gray-200 mb-2">
              {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                <li key={idx} className="py-2 flex justify-between text-sm">
                  <span>{item.productId?.name || item.productName || item.product?.name || 'Product'}</span>
                  <span>Qty: {item.quantity || 0}</span>
                </li>
              )) : (
                <li className="py-2 text-sm text-gray-500">No items found</li>
              )}
            </ul>
            <div className="font-bold mt-2">
              Total: ₹{(order.totalAmount || order.total || 0).toFixed(2)}
            </div>
          </div>
        ) : null}
        <div className="mt-8 flex flex-col gap-2">
          <Link to="/products" className="text-blue-600 hover:underline font-medium">Continue Shopping</Link>
          <Link to="/orders" className="text-green-700 hover:underline font-medium">View My Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;