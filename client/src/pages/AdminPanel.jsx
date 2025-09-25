// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch {
      console.log('Error loading users');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data.data || res.data);
    } catch {
      console.log('Error loading products');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch {
      console.log('Error loading orders');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProducts();
    fetchOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      {/* Users */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-3">Users</h3>
        {users.length === 0 && <p className="text-gray-500">No users found.</p>}
        {users.map((user) => (
          <div key={user._id} className="flex justify-between items-center bg-white shadow p-3 mb-2 rounded">
            <div>
              <span className="font-medium">{user.name}</span> ({user.email}) – <span className="italic">{user.role}</span>
            </div>
            <button
              onClick={() => deleteUser(user._id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Products */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-3">Products</h3>
        {products.length === 0 && <p className="text-gray-500">No products available.</p>}
        {products.map((product) => (
          <div
            key={product._id}
            className="flex justify-between items-center bg-gray-100 p-3 mb-2 rounded"
          >
            <div>
              <strong>{product.name}</strong> – ₹{product.price}
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/edit-product/${product._id}`}
                className="text-blue-600 hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() => deleteProduct(product._id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Orders */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-3">All Orders</h3>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white p-3 rounded shadow mb-3">
              <div className="font-medium">Hotel: {order.hotelName || 'N/A'}</div>
              <ul className="ml-4 list-disc text-sm mt-1">
                {order.products.map((p, index) => (
                  <li key={index}>
                    {p.name} – ₹{p.price}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
