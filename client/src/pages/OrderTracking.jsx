import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../api/order';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  Eye,
  X
} from 'lucide-react';
import BackButton from '../components/BackButton';
// import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getOrders(user._id);
        console.log('OrderTracking - Fetched orders:', res.data); // Debug log
        setOrders(res.data || []);
        
        // If orderId is provided in URL, find and select that order
        if (orderId && res.data) {
          const order = res.data.find(o => o._id === orderId || o.originalOrderId === orderId);
          if (order) {
            console.log('OrderTracking - Selected order status:', order.status); // Debug log
            setSelectedOrder(order);
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && token) fetchOrders();
  }, [user, token, orderId]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ready':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status, isActive = false) => {
    const iconClass = `w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`;
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className={iconClass} />;
      case 'confirmed':
        return <CheckCircle className={iconClass} />;
      case 'preparing':
        return <Package className={iconClass} />;
      case 'ready':
        return <Truck className={iconClass} />;
      case 'delivered':
        return <CheckCircle className={iconClass} />;
      case 'cancelled':
        return <X className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getStatusProgress = (status) => {
    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    const currentIndex = statuses.indexOf(status?.toLowerCase());
    return currentIndex >= 0 ? ((currentIndex + 1) / statuses.length) * 100 : 0;
  };

  const OrderTimeline = ({ order }) => {
    const statuses = [
      { key: 'pending', label: 'Order Placed', description: 'Your order has been received' },
      { key: 'confirmed', label: 'Confirmed', description: 'Seller has confirmed your order' },
      { key: 'preparing', label: 'Preparing', description: 'Your order is being prepared' },
      { key: 'ready', label: 'Ready for Delivery', description: 'Order is ready to be shipped' },
      { key: 'delivered', label: 'Delivered', description: 'Order has been delivered' }
    ];

    const currentStatusIndex = statuses.findIndex(s => s.key === order.status?.toLowerCase());
    const isCancelled = order.status?.toLowerCase() === 'cancelled';

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Package className="w-5 h-5 mr-2 text-blue-600" />
          Order Timeline
        </h3>
        
        {isCancelled ? (
          <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
            <X className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <p className="font-medium text-red-800">Order Cancelled</p>
              <p className="text-sm text-red-600">This order has been cancelled</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {statuses.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isActive = index === currentStatusIndex;
              
              return (
                <div key={status.key} className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-gray-100 border-gray-300'
                    }`}>
                      {getStatusIcon(status.key, isCompleted)}
                    </div>
                    {index < statuses.length - 1 && (
                      <div className={`w-0.5 h-8 mt-2 ${
                        isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {status.label}
                      </h4>
                      {isActive && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      isCompleted ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {status.description}
                    </p>
                    {isActive && order.expectedDeliveryDate && (
                      <div className="flex items-center mt-2 text-sm text-blue-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        Expected: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono text-sm font-medium">{order.originalOrderId || order._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="text-sm font-medium">
                  {order.orderedAt ? new Date(order.orderedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Product Information</h3>
              <div className="flex items-start space-x-4">
                {order.item?.productId?.image && (
                  <img
                    src={order.item.productId.image}
                    alt={order.item?.productId?.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{order.item?.productId?.name}</h4>
                  <p className="text-sm text-gray-600">Quantity: {order.item?.quantity}</p>
                  <p className="text-sm text-gray-600">Price: ₹{order.item?.price} each</p>
                  <p className="text-sm font-medium text-green-600">
                    Total: ₹{(order.item?.price || 0) * (order.item?.quantity || 1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Seller Information
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">Name:</span> {order.item?.sellerId?.name || 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Email:</span> {order.item?.sellerId?.email || 'N/A'}
                </p>
              </div>
            </div>

            {/* Billing Info */}
            {order.billingInfo && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-medium">{order.billingInfo.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium">{order.billingInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone:</p>
                    <p className="font-medium">{order.billingInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Address:</p>
                    <p className="font-medium">
                      {order.billingInfo.address?.street}, {order.billingInfo.address?.city}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Loading Orders</h3>
            <p className="text-gray-600">Fetching your order information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BackButton 
                onClick={() => navigate(-1)}
                className="mr-6"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
                <p className="text-gray-600 mt-1">Track your orders in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <Package className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Orders List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Your Orders</h2>
                  <p className="text-sm text-gray-600 mt-1">{orders.length} orders found</p>
                </div>
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedOrder?._id === order._id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-mono text-xs text-gray-500">
                              #{order.originalOrderId?.slice(-8) || order._id.slice(-8)}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 text-sm mb-1">
                            {order.item?.productId?.name || 'Product'}
                          </h3>
                          <p className="text-xs text-gray-600">
                            Qty: {order.item?.quantity} • ₹{order.totalAmount}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {order.orderedAt ? new Date(order.orderedAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="lg:col-span-2">
              {selectedOrder ? (
                <div className="space-y-6">
                  {/* Order Header */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Order #{selectedOrder.originalOrderId?.slice(-8) || selectedOrder._id.slice(-8)}
                        </h2>
                        <p className="text-gray-600 mt-1">
                          Placed on {selectedOrder.orderedAt ? new Date(selectedOrder.orderedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                        <button
                          onClick={() => setShowModal(true)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View full details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(getStatusProgress(selectedOrder.status))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${getStatusProgress(selectedOrder.status)}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Product</p>
                        <p className="font-medium">{selectedOrder.item?.productId?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Quantity</p>
                        <p className="font-medium">{selectedOrder.item?.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Amount</p>
                        <p className="font-medium text-green-600">₹{selectedOrder.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expected Delivery</p>
                        <p className="font-medium">
                          {selectedOrder.expectedDeliveryDate 
                            ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString()
                            : 'TBD'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <OrderTimeline order={selectedOrder} />

                  {/* Delivery Info */}
                  {selectedOrder.expectedDeliveryDate && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Truck className="w-5 h-5 mr-2 text-green-600" />
                        Delivery Information
                      </h3>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-green-600 mr-3" />
                          <div>
                            <p className="font-medium text-green-800">
                              Expected Delivery: {new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-green-600">
                              We'll notify you when your order is out for delivery
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Order</h3>
                  <p className="text-gray-600">Choose an order from the list to view its tracking details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default OrderTracking;
