import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
                  Hot-Del
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                  Your trusted partner in sourcing fresh, cold-chain dairy & frozen products for hotels across India. 
                  Delivering quality and reliability since day one.
                </p>
              </div>
              
              {/* Newsletter Signup */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h4 className="text-xl font-semibold mb-3 text-white">Stay Updated</h4>
                <p className="text-gray-400 text-sm mb-4">Get the latest updates on products and offers</p>
                <div className="flex gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg">
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-semibold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/hotel-signup" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Hotel Signup
                  </Link>
                </li>
                <li>
                  <Link to="/seller-signup" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Become a Seller
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Order Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xl font-semibold mb-6 text-white">Contact Us</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">Mumbai, Maharashtra</p>
                    <p className="text-gray-400 text-sm">India</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">+91 8850050602</p>
                    <p className="text-gray-400 text-sm">24/7 Support</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">support@hotdel.com</p>
                    <p className="text-gray-400 text-sm">Get in touch</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h5 className="text-lg font-semibold mb-4 text-white">Follow Us</h5>
                <div className="flex gap-4">
                  <a 
                    href="#" 
                    aria-label="Facebook"
                    className="p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-xl transition-all duration-200 group"
                  >
                    <Facebook className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                  </a>
                  <a 
                    href="#" 
                    aria-label="Instagram"
                    className="p-3 bg-pink-600/20 hover:bg-pink-600/30 rounded-xl transition-all duration-200 group"
                  >
                    <Instagram className="w-5 h-5 text-pink-400 group-hover:text-pink-300" />
                  </a>
                  <a 
                    href="#" 
                    aria-label="Twitter"
                    className="p-3 bg-sky-600/20 hover:bg-sky-600/30 rounded-xl transition-all duration-200 group"
                  >
                    <Twitter className="w-5 h-5 text-sky-400 group-hover:text-sky-300" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-700/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Hot-Del. All rights reserved.
              </div>
              <div className="flex gap-6 text-sm text-gray-400">
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
