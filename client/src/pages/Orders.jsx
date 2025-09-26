// pages/Orders.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrders, getSellerOrders, updateOrderStatus, cancelOrder } from '../api/order';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Orders = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const isSellerRoute = location.pathname.startsWith('/seller/orders');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        let res;
        if (isSellerRoute || user?.role === 'seller') {
          res = await getSellerOrders(token);
        } else {
          res = await getOrders(user._id);
        }
        console.log('Fetched orders:', res.data); // Debug log
        setOrders(res.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) fetchOrders();
  }, [user, token, isSellerRoute]);

  const handleGoBack = () => {
    navigate(-1);
  };
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, token);
      
      // Update the local state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      toast.success('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleDeliveryDateUpdate = async (orderId, deliveryDate) => {
    try {
      const currentOrder = orders.find(order => order._id === orderId);
      await updateOrderStatus(orderId, currentOrder.status, token, deliveryDate);
      
      // Update the local state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, expectedDeliveryDate: deliveryDate }
          : order
      ));
      
      toast.success('Delivery date updated successfully!');
    } catch (error) {
      console.error('Error updating delivery date:', error);
      toast.error('Failed to update delivery date');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const confirmMsg = 'Are you sure you want to cancel this order? Items not yet delivered will be cancelled.';
      if (!window.confirm(confirmMsg)) return;

      await cancelOrder(orderId, token);

      // Update local state: mark all rows with this order id as cancelled
      setOrders(prev => prev.map(o => (
        (o._id === orderId || o.originalOrderId === orderId)
          ? { ...o, status: 'cancelled', item: { ...o.item, status: 'cancelled' } }
          : o
      )));

      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      const msg = error?.response?.data?.message || 'Failed to cancel order';
      toast.error(msg);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'preparing':
        return 'bg-orange-100 text-orange-700';
      case 'ready':
        return 'bg-purple-100 text-purple-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="flex items-center mb-6">
        <BackButton 
          onClick={handleGoBack}
          className="mr-4"
        />
        <h1 className="text-2xl font-bold text-blue-800">
          {isSellerRoute || user?.role === 'seller' ? 'Orders on My Products' : 'My Orders'}
        </h1>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mr-4"></div>
          <span className="text-gray-500">Loading orders...</span>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No orders found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="py-2 px-4 text-left">Order ID</th>
                <th className="py-2 px-4 text-left">Products</th>
                <th className="py-2 px-4 text-left">{(isSellerRoute || user?.role === 'seller') ? 'Buyer (Hotel)' : 'Seller'}</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Order Date</th>
                <th className="py-2 px-4 text-left">Expected Delivery</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={`${order._id}-${index}`} className="border-b hover:bg-blue-50">
                  <td className="py-2 px-4 font-mono text-xs">{order.originalOrderId || order._id}</td>
                  <td className="py-2 px-4">
                    <div className="text-sm">
                      <div className="font-medium">
                        {order.item?.productId?.name || 'Product'} x {order.item?.quantity || 1}
                      </div>
                      {order.item?.productId?.brand && (
                        <div className="text-xs text-gray-500">Brand: {order.item.productId.brand}</div>
                      )}
                      {order.item?.productId?.category && (
                        <div className="text-xs text-gray-500">Category: {order.item.productId.category}</div>
                      )}
                      <div className="text-xs text-green-600 font-medium">
                        ₹{order.item?.price || 0} each
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="text-sm">
                      {(isSellerRoute || user?.role === 'seller') ? (
                        // Show buyer info for sellers
                        <div>
                          <div className="font-medium">
                            {order.buyerInfo?.name || order.hotelId?.name || 'Hotel'}
                          </div>
                          {order.buyerInfo?.email && (
                            <div className="text-xs text-gray-500">{order.buyerInfo.email}</div>
                          )}
                        </div>
                      ) : (
                        // Show seller info for hotels
                        <div>
                          <div className="font-medium">
                            {order.item?.sellerId?.name || order.item?.sellerId?.businessName || 'Seller'}
                          </div>
                          {order.item?.sellerId?.email && (
                            <div className="text-xs text-gray-500">{order.item.sellerId.email}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-xs text-gray-500">
                    {order.orderedAt ? new Date(order.orderedAt).toLocaleString() : ''}
                  </td>
                  <td className="py-2 px-4 text-xs">
                    {order.expectedDeliveryDate ? (
                      <span className="text-green-600 font-medium">
                        {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {isSellerRoute || user?.role === 'seller' ? (
                      <div className="flex flex-col gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <input
                          type="datetime-local"
                          value={order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toISOString().slice(0, 16) : ''}
                          onChange={(e) => handleDeliveryDateUpdate(order._id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={['delivered', 'cancelled'].includes((order.status || '').toLowerCase())}
                          onClick={() => handleCancelOrder(order.originalOrderId || order._id)}
                          className={`text-xs px-3 py-1 rounded border ${['delivered', 'cancelled'].includes((order.status || '').toLowerCase()) ? 'cursor-not-allowed text-gray-400 border-gray-200' : 'text-red-600 border-red-300 hover:bg-red-50'}`}
                          title={['delivered', 'cancelled'].includes((order.status || '').toLowerCase()) ? 'Cannot cancel delivered or already cancelled orders' : 'Cancel this order'}
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
