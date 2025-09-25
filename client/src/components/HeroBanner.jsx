// src/components/HeroBanner.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Truck, Shield, Star, ArrowRight, Users, Package, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const HeroBanner = ({ isVisible = false }) => {
  const { user } = useAuth();
  
  // Check if user is logged in and is a hotel user
  const isHotelUserLoggedIn = user && user.role === 'hotel';

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-20 h-20 bg-purple-100/20 rounded-full animate-float delay-200"></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-blue-100/20 rounded-full animate-float delay-400"></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-purple-100/20 rounded-full animate-float delay-600"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-blue-100/10 rounded-full animate-float delay-300"></div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(147,51,234,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              {/* Trust Badge - Slides from top with bounce */}
              <div className={`inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium shadow-lg ${isVisible ? 'animate-slide-from-top opacity-100' : 'opacity-0'} transition-all duration-800 ease-out`}>
                <Star className="w-4 h-4 mr-2 animate-float" />
                Trusted by 500+ Hotels
              </div>
              
              {/* Main Heading - Slides from left with dramatic effect */}
              <h1 className={`text-5xl lg:text-6xl font-bold text-gray-900 leading-tight ${isVisible ? 'animate-slide-from-left delay-300 opacity-100' : 'opacity-0'}`}>
                Premium
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse"> Dairy </span>
                & Frozen Products
              </h1>
              
              {/* Description - Slides from left with stagger */}
              <p className={`text-xl text-gray-600 leading-relaxed max-w-lg ${isVisible ? 'animate-slide-from-left delay-500 opacity-100' : 'opacity-0'}`}>
                Your trusted partner for sourcing fresh, cold-chain dairy & frozen products. 
                Quality guaranteed, delivered directly to your hotel.
              </p>
            </div>

            {/* CTA Buttons - Slide from bottom with dramatic effect */}
            <div className={`flex flex-col sm:flex-row gap-4 ${isVisible ? 'animate-slide-from-bottom delay-700 opacity-100' : 'opacity-0'}`}>
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl group hover-lift"
              >
                <ShoppingCart className="w-5 h-5 mr-2 group-hover:animate-float" />
                Browse Products
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              
              {/* Only show Join as Hotel button if hotel user is not logged in */}
              {!isHotelUserLoggedIn && (
                <Link
                  to="/hotel-signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join as Hotel
                </Link>
              )}
            </div>

            {/* Trust Indicators - Slide from bottom with individual stagger */}
            <div className="flex items-center gap-8 pt-4">
              <div className={`flex items-center gap-2 hover-lift ${isVisible ? 'animate-slide-from-bottom delay-900 opacity-100' : 'opacity-0'}`}>
                <div className="p-2 bg-green-100 rounded-lg shadow-md">
                  <Shield className="w-5 h-5 text-green-600 animate-float" />
                </div>
                <span className="text-sm font-medium text-gray-700">Quality Assured</span>
              </div>
              
              <div className={`flex items-center gap-2 hover-lift ${isVisible ? 'animate-slide-from-bottom delay-1000 opacity-100' : 'opacity-0'}`}>
                <div className="p-2 bg-blue-100 rounded-lg shadow-md">
                  <Truck className="w-5 h-5 text-blue-600 animate-float delay-100" />
                </div>
                <span className="text-sm font-medium text-gray-700">Fast Delivery</span>
              </div>
              
              <div className={`flex items-center gap-2 hover-lift ${isVisible ? 'animate-slide-from-bottom delay-1100 opacity-100' : 'opacity-0'}`}>
                <div className="p-2 bg-purple-100 rounded-lg shadow-md">
                  <Clock className="w-5 h-5 text-purple-600 animate-float delay-200" />
                </div>
                <span className="text-sm font-medium text-gray-700">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right Content - Animated Feature Cards */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              {/* Feature Card 1 - Slides from right with dramatic effect */}
              <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover-lift border border-gray-100 group transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`} style={{ transitionDelay: isVisible ? '0.4s' : '0s' }}>
                <div className="p-3 bg-blue-100 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-8 h-8 text-blue-600 animate-float" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Fresh Products</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">Cold-chain maintained dairy and frozen goods</p>
              </div>

              {/* Feature Card 2 - Slides from right with stagger */}
              <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover-lift border border-gray-100 mt-8 group transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`} style={{ transitionDelay: isVisible ? '0.6s' : '0s' }}>
                <div className="p-3 bg-green-100 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8 text-green-600 animate-float delay-100" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Quick Delivery</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">Same-day delivery across major cities</p>
              </div>

              {/* Feature Card 3 - Slides from right */}
              <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover-lift border border-gray-100 group transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`} style={{ transitionDelay: isVisible ? '0.5s' : '0s' }}>
                <div className="p-3 bg-purple-100 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-purple-600 animate-float delay-200" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Quality Guaranteed</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">100% quality assurance on all products</p>
              </div>

              {/* Feature Card 4 - Slides from right with final stagger */}
              <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover-lift border border-gray-100 mt-8 group transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`} style={{ transitionDelay: isVisible ? '0.7s' : '0s' }}>
                <div className="p-3 bg-orange-100 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-orange-600 animate-float delay-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Trusted Partner</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">Serving 500+ hotels across India</p>
              </div>
            </div>

            {/* Floating Stats - Dramatic zoom in with bounce */}
            <div className={`absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-4 shadow-2xl border-2 border-white ${isVisible ? 'animate-zoom-in delay-800 opacity-100' : 'opacity-0'} hover:scale-110 hover:shadow-3xl transition-all duration-300`}>
              <div className="text-center">
                <div className="text-2xl font-bold animate-pulse">500+</div>
                <div className="text-sm opacity-90">Happy Hotels</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
