import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { HotelProvider } from './context/HotelContext';
import { Toaster } from 'react-hot-toast';

import './index.css'; // Tailwind CSS or global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HotelProvider>
          <CartProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <App />
          </CartProvider>
        </HotelProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
