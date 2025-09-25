// src/components/LoadingScreen.jsx
import React from 'react';
import { Crown, Sparkles } from 'lucide-react';

const LoadingScreen = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 z-50 flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/5 rounded-full animate-float delay-200"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/10 rounded-full animate-float delay-400"></div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-white/5 rounded-full animate-float delay-600"></div>
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center">
        {/* Logo Animation */}
        <div className="mb-8 animate-zoom-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <Crown className="w-12 h-12 text-yellow-300 animate-bounce-in" />
            <h1 className="text-4xl font-bold text-white">Hot-Del</h1>
            <Crown className="w-12 h-12 text-yellow-300 animate-bounce-in delay-200" />
          </div>
          <p className="text-blue-100 text-lg font-medium">Premium Dairy & Frozen Products</p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center items-center space-x-2 animate-fade-in-up delay-300">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>
        </div>

        {/* Loading Text */}
        <p className="text-blue-100 mt-4 animate-fade-in-up delay-500">
          Loading your premium experience...
        </p>

        {/* Decorative Elements */}
        <div className="absolute -top-10 -left-10">
          <Sparkles className="w-6 h-6 text-yellow-300 animate-rotate" />
        </div>
        <div className="absolute -bottom-10 -right-10">
          <Sparkles className="w-6 h-6 text-yellow-300 animate-rotate delay-300" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
