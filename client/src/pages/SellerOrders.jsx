// src/pages/SellerOrders.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSellerOrders } from '../api/order';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  ShoppingCart, 
  Package, 
  Eye, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Filter, 
  DollarSign,
  Truck,
  Search
} from 'lucide-react';
import BackButton from '../components/BackButton';

const SellerOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      
      setLoading(true);
      setError('');
      
      try {
        const response = await getSellerOrders(token);
        setOrders(response.data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Orders functionality may not be fully implemented yet.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [token]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/api/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Update order status error:', error);
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      
      <div className="relative px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl p-8 mb-8 border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Orders Management
                  </h1>
                  <p className="text-lg text-gray-600">Manage and track all orders for your products</p>
                </div>
              </div>
              <BackButton 
                onClick={() => window.location.href = '/seller-dashboard'}
                variant="default"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Filter Orders</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-3 rounded-xl font-semibold capitalize transition-all duration-300 flex items-center gap-2 ${
                    filter === status 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform -translate-y-0.5' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  {status === 'pending' && <Clock className="w-4 h-4" />}
                  {status === 'processing' && <Package className="w-4 h-4" />}
                  {status === 'shipped' && <Truck className="w-4 h-4" />}
                  {status === 'delivered' && <CheckCircle className="w-4 h-4" />}
                  {status === 'cancelled' && <XCircle className="w-4 h-4" />}
                  {status} ({status === 'all' ? orders.length : orders.filter(o => o.status === status).length})
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mr-4"></div>
                <span className="text-gray-600 text-lg">Loading orders...</span>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
                <p className="text-gray-500 mb-6">
                  This might be because the orders system is not fully set up yet.
                </p>
                <Link 
                  to="/seller-dashboard" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Return to Dashboard
                </Link>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 text-xl mb-2">
                  {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
                </p>
                <p className="text-gray-500 mb-6">
                  Orders will appear here once customers start buying your products.
                </p>
                <Link 
                  to="/add-product" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Add More Products
                </Link>
              </div>
            ) : (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hotel Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Products</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.map(order => (
                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors duration-200">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            #{order._id.slice(-8)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{order.buyerInfo?.name || order.billingInfo?.fullName || 'N/A'}</div>
                                <div className="text-gray-500 text-xs flex items-center mt-1">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {order.buyerInfo?.email || order.billingInfo?.email || 'N/A'}
                                </div>
                                <div className="text-gray-500 text-xs flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {order.buyerInfo?.phone || order.billingInfo?.phone || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {order.item?.productId?.name || 'Product'}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  Qty: {order.item?.quantity || 1} × ₹{order.item?.price || 0}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-gray-900">
                                ₹{(order.sellerSubtotal || order.totalAmount || 0).toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status === 'delivered' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {order.status === 'processing' && <Clock className="w-3 h-3 mr-1" />}
                              {order.status === 'shipped' && <Truck className="w-3 h-3 mr-1" />}
                              {order.status || 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowOrderModal(true);
                                }}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                              <select
                                value={order.status || 'pending'}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Order Details Modal */}
          {showOrderModal && selectedOrder && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                <div className="p-8 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Order Details #{selectedOrder._id.slice(-8)}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowOrderModal(false)}
                      className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-colors duration-200"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                </div>
              
                <div className="p-8 space-y-8">
                  {/* Customer Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <User className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-900">Hotel Customer Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.buyerInfo?.name || selectedOrder.billingInfo?.fullName || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.buyerInfo?.email || selectedOrder.billingInfo?.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.buyerInfo?.phone || selectedOrder.billingInfo?.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-semibold text-gray-900 capitalize">{selectedOrder.paymentMethod || 'COD'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {(selectedOrder.buyerInfo?.address || selectedOrder.billingInfo?.address) && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <MapPin className="w-6 h-6 text-green-600" />
                        <h3 className="text-xl font-bold text-gray-900">Delivery Address</h3>
                      </div>
                      <div className="text-gray-700 space-y-1">
                        <p className="font-medium">{(selectedOrder.buyerInfo?.address || selectedOrder.billingInfo?.address)?.street}</p>
                        <p>
                          {(selectedOrder.buyerInfo?.address || selectedOrder.billingInfo?.address)?.city}, {' '}
                          {(selectedOrder.buyerInfo?.address || selectedOrder.billingInfo?.address)?.state} {' '}
                          {(selectedOrder.buyerInfo?.address || selectedOrder.billingInfo?.address)?.zipCode}
                        </p>
                        <p className="font-medium">{(selectedOrder.buyerInfo?.address || selectedOrder.billingInfo?.address)?.country}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <Package className="w-6 h-6 text-purple-600" />
                      <h3 className="text-xl font-bold text-gray-900">Order Item</h3>
                    </div>
                    <div className="space-y-4">
                      {selectedOrder.item && (
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{selectedOrder.item.productId?.name || 'Product'}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Quantity: {selectedOrder.item.quantity} × ₹{selectedOrder.item.price?.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Category: {selectedOrder.item.productId?.category || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900">₹{((selectedOrder.item.price || 0) * (selectedOrder.item.quantity || 0)).toFixed(2)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                      <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span className="font-semibold">₹{(selectedOrder.sellerSubtotal || selectedOrder.subtotal || 0).toFixed(2)}</span>
                      </div>
                      {selectedOrder.tax > 0 && (
                        <div className="flex justify-between text-gray-700">
                          <span>Tax (18% GST):</span>
                          <span className="font-semibold">₹{(selectedOrder.tax || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-xl text-gray-900 border-t border-yellow-300 pt-3">
                        <span>Total Amount:</span>
                        <span>₹{(selectedOrder.sellerSubtotal || selectedOrder.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-6 h-6 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Order Status</p>
                        <span className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status === 'delivered' && <CheckCircle className="w-4 h-4 mr-2" />}
                          {selectedOrder.status === 'processing' && <Clock className="w-4 h-4 mr-2" />}
                          {selectedOrder.status === 'shipped' && <Truck className="w-4 h-4 mr-2" />}
                          {selectedOrder.status || 'pending'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-6 h-6 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-semibold text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-gray-200">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {orders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Orders</h3>
                    <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Revenue</h3>
                    <p className="text-3xl font-bold text-green-600">
                      ₹{orders.reduce((sum, order) => sum + (order.sellerSubtotal || order.totalAmount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Pending Orders</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                      {orders.filter(o => o.status === 'pending' || !o.status).length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-xl">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Completed Orders</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {orders.filter(o => o.status === 'delivered').length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;
