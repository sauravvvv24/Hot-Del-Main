// src/pages/SellerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyProducts, getSellerOrders } from '../api/order';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  BarChart3,
  ArrowUpRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Star
} from 'lucide-react';

const SellerDashboard = () => {
  const { token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    featuredProducts: 0,
    outOfStockProducts: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching products with token:', token?.substring(0, 20) + '...');
        // Fetch products
        const productsRes = await getMyProducts(token);
        console.log('Products response:', productsRes);
        const productsData = productsRes.data || [];
        setProducts(productsData);
        
        // Calculate stats with debugging
        console.log('Products data for stats calculation:', productsData);
        
        const activeProducts = productsData.filter(p => p.isActive === true && !p.outOfStock).length;
        const featuredProducts = productsData.filter(p => p.featured === true).length; // Remove isActive requirement
        const outOfStockProducts = productsData.filter(p => p.outOfStock === true).length;
        
        console.log('Stats calculated:', {
          totalProducts: productsData.length,
          activeProducts,
          featuredProducts,
          outOfStockProducts,
          featuredProductsList: productsData.filter(p => p.featured === true)
        });
        
        setStats(prev => ({
          ...prev,
          totalProducts: productsData.length,
          activeProducts: activeProducts,
          featuredProducts: featuredProducts,
          outOfStockProducts: outOfStockProducts
        }));

        // Fetch orders
        setOrdersLoading(true);
        try {
          const ordersRes = await getSellerOrders(token);
          const ordersData = ordersRes.data || [];
          setOrders(ordersData);
          
          // Exclude cancelled items from revenue
          const totalRevenue = ordersData
            .filter(order => (order.status || '').toLowerCase() !== 'cancelled')
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
          setStats(prev => ({
            ...prev,
            totalOrders: ordersData.length,
            totalRevenue: totalRevenue
          }));
        } catch {
          console.log('Orders endpoint not available yet');
          setOrders([]);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          setError('Failed to load dashboard data.');
        }
        setProducts([]);
      } finally {
        setLoading(false);
        setOrdersLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error('Failed to delete product');
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
                  <Store className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Seller Dashboard
                  </h1>
                  <p className="text-lg text-gray-600">Welcome back, <span className="font-semibold text-gray-800">{user?.name || 'Seller'}</span>! Manage your business efficiently.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  to="/add-product" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" /> Add Product
                </Link>
                <Link 
                  to="/seller/orders" 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <ShoppingCart className="w-5 h-5" /> Orders
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-xs text-gray-500 mt-1">All your products</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Available Products</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeProducts}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready to sell</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Featured Products</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.featuredProducts}</p>
                  <p className="text-xs text-gray-500 mt-1">Highlighted on homepage</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-xl shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.totalOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">Orders received</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Out of Stock</p>
                  <p className="text-3xl font-bold text-red-600">{stats.outOfStockProducts}</p>
                  <p className="text-xs text-gray-500 mt-1">Need restocking</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-xl shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-600">₹{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Earnings to date</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Your Products</h2>
              </div>
              <Link 
                to="/add-product" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mr-4"></div>
                <span className="text-gray-600 text-lg">Loading your products...</span>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <div className="text-red-600 text-lg font-medium">{error}</div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 text-xl mb-2">No products yet</p>
                <p className="text-gray-500 mb-6">Start building your inventory by adding your first product.</p>
                <Link 
                  to="/add-product" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Add Your First Product
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product._id} className="relative group">
                    <div className="relative">
                      <ProductCard product={product} showEditButton={true} />
                      
                      {/* Status badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.featured && (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3" /> Featured
                          </span>
                        )}
                        {product.outOfStock && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        )}
                        {!product.isActive && (
                          <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="bg-red-500 text-white p-2 rounded-lg text-sm font-semibold hover:bg-red-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>
              </div>
              <Link 
                to="/seller/orders" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Eye className="w-4 h-4" /> View All Orders
              </Link>
            </div>
            
            {ordersLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mr-4"></div>
                <span className="text-gray-600 text-lg">Loading orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 text-xl mb-2">No orders yet</p>
                <p className="text-gray-500">Orders will appear here once customers start buying your products.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order._id} className="hover:bg-gray-50/50 transition-colors duration-200">
                        <td className="px-6 py-4 font-medium text-gray-900">#{order._id.slice(-6)}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {order.buyerInfo?.name || 
                           order.hotelId?.name || 
                           order.billingInfo?.fullName || 
                           'Unknown Customer'}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {order.item?.productId?.name || 'Product'} 
                          <span className="text-gray-500 text-sm ml-1">
                            (Qty: {order.item?.quantity || 1})
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">₹{order.totalAmount?.toLocaleString() || 0}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'delivered' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {(order.status === 'preparing' || order.status === 'pending') && <Clock className="w-3 h-3 mr-1" />}
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
