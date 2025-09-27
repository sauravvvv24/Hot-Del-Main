import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import HotelSignup from './pages/HotelSignup';
import SellerSignup from './pages/SellerSignup';
import SellerLogin from './pages/SellerLogin';
import HotelLogin from './pages/HotelLogin';
import AddProduct from './pages/AddProduct';
import MyProducts from './pages/MyProducts';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import AdminPanel from './pages/AdminPanel';
import Signup from './pages/Signup'; // Unified Signup
import Login from './pages/Login';   // Unified Login (optional)
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Search from './pages/Search';
import HotelDashboard from './pages/HotelDashboard';
import SellerDashboard from './pages/SellerDashboard';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile'; // Assuming Profile component is in pages/Profile.jsx
import NewProfile from './pages/NewProfile';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import Billing from './pages/Billing';
import Wishlist from './pages/Wishlist';
import TestCancellation from './pages/TestCancellation';

const App = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-4">
        <Routes>
          {/* Home and Products */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/category/:category" element={<CategoryPage />} />
          <Route path="/products/:productId" element={<ProductDetail />} />

          {/* Unified Auth (optional, remove if not using these) */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Separate Auth Routes */}
          <Route path="/hotel-signup" element={<HotelSignup />} />
          <Route path="/seller-signup" element={<SellerSignup />} />
          <Route path="/hotel-login" element={<HotelLogin />} />
          <Route path="/seller-login" element={<SellerLogin />} />

          {/* Seller-Specific */}
          <Route path="/seller-dashboard" element={<PrivateRoute allowedRoles={['seller']}><SellerDashboard /></PrivateRoute>} />
          <Route path="/add-product" element={<PrivateRoute allowedRoles={['seller']}><AddProduct /></PrivateRoute>} />
          <Route path="/seller/add-product" element={<PrivateRoute allowedRoles={['seller']}><AddProduct /></PrivateRoute>} />
          <Route path="/edit-product/:id" element={<PrivateRoute allowedRoles={['seller']}><AddProduct editMode={true} /></PrivateRoute>} />
          <Route path="/seller/edit-product/:id" element={<PrivateRoute allowedRoles={['seller']}><AddProduct editMode={true} /></PrivateRoute>} />
          <Route path="/seller/orders" element={<PrivateRoute allowedRoles={['seller']}><Orders /></PrivateRoute>} />
          <Route path="/my-products" element={<PrivateRoute allowedRoles={['seller']}><MyProducts /></PrivateRoute>} />

          {/* Hotel-Specific */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<PrivateRoute allowedRoles={['hotel']}><Wishlist /></PrivateRoute>} />
          <Route path="/billing" element={<PrivateRoute allowedRoles={['hotel']}><Billing /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute allowedRoles={['hotel']}><Checkout /></PrivateRoute>} />
          <Route path="/order-confirmation" element={<PrivateRoute allowedRoles={['hotel']}><OrderConfirmation /></PrivateRoute>} />
          <Route path="/dashboard/hotel" element={<PrivateRoute allowedRoles={['hotel']}><HotelDashboard /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute allowedRoles={['hotel']}><Orders /></PrivateRoute>} />
          <Route path="/track-orders" element={<PrivateRoute allowedRoles={['hotel']}><OrderTracking /></PrivateRoute>} />
          <Route path="/track-orders/:orderId" element={<PrivateRoute allowedRoles={['hotel']}><OrderTracking /></PrivateRoute>} />
          <Route path="/search" element={<Search />} />

          {/* Profile */}
          <Route path="/profile/:email" element={<Profile />} />
          <Route path="/new-profile/:email" element={<NewProfile />} />

          {/* Payment Routes */}
          <Route path="/payment-success/:orderId" element={<PrivateRoute allowedRoles={['hotel']}><PaymentSuccess /></PrivateRoute>} />
          <Route path="/payment-failure/:orderId" element={<PrivateRoute allowedRoles={['hotel']}><PaymentFailure /></PrivateRoute>} />
          
          {/* Test Routes */}
          <Route path="/test-cancellation" element={<TestCancellation />} />

          {/* Admin Panel */}
          <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminPanel /></PrivateRoute>} />

          {/* Redirects for typos */}
          <Route path="/hotelsignup" element={<Navigate to="/hotel-signup" />} />
          <Route path="/hotellogin" element={<Navigate to="/hotel-login" />} />
          <Route path="/sellersignup" element={<Navigate to="/seller-signup" />} />
          <Route path="/sellerlogin" element={<Navigate to="/seller-login" />} />

          {/* Catch-all */}
          <Route path="*" element={<div className="text-center mt-10 text-xl">404 - Page Not Found</div>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
