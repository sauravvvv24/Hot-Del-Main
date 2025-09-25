// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get('/api/admin/users');
        const productRes = await axios.get('/api/products');
        setUsers(userRes.data);
        setProducts(productRes.data);
      } catch (err) {
        console.error('Error loading dashboard data');
      }
    };

    if (auth.user?.role === 'admin') fetchData();
  }, [auth]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Users</h3>
          {users.map((u) => (
            <div key={u._id} className="mb-2 p-2 border rounded">
              {u.email} — <span className="italic">{u.role}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Products</h3>
          {products.map((p) => (
            <div key={p._id} className="mb-2 p-2 border rounded">
              {p.name} — ₹{p.price}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
