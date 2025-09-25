// client/src/pages/Products.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';
import { Package, Star, ShoppingBag, Filter, Grid, List, Search, ChevronRight, Home, Sparkles, Zap, Crown, Truck, Shield, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is logged in and is a hotel user
  const isHotelUserLoggedIn = user && user.role === 'hotel';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/products/');
        const productData = response.data || [];
        setProducts(productData);
        setFilteredProducts(productData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
        // Start animations after loading
        setTimeout(() => setIsVisible(true), 100);
        setTimeout(() => setHeroVisible(true), 300);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Loading Products</h3>
            <p className="text-gray-600">Fetching our premium collection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md mx-4">
          <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Products</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-royal-gradient relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 animate-gradient">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white/5 rounded-full animate-float delay-200"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float delay-400"></div>
        <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white/5 rounded-full animate-float delay-600"></div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className={`flex items-center space-x-2 text-sm transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </button>
            <ChevronRight className="w-4 h-4 text-blue-400" />
            <span className="text-blue-900 font-semibold">All Products</span>
          </nav>
        </div>
      </div>

      {/* Premium Hero Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Animated Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-8 border border-white/30 animate-bounce-in">
              <Sparkles className="w-5 h-5 mr-2 animate-rotate" />
              Premium Quality Products
              <Crown className="w-5 h-5 ml-2 text-yellow-300 animate-pulse-glow" />
            </div>
            
            {/* Animated Title */}
            <div className="inline-flex items-center gap-3 mb-6">
              <Zap className="w-10 h-10 text-yellow-300 animate-bounce-in" />
              <h1 className="text-5xl lg:text-6xl font-bold text-white">
                🔥 Our Premium
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent block">
                  Collection ⭐
                </span>
              </h1>
              <Zap className="w-10 h-10 text-yellow-300 animate-bounce-in delay-200" />
            </div>
            
            <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-12 font-medium">
              Discover our extensive range of fresh dairy, frozen goods, and premium products 
              sourced directly from certified suppliers across India. Quality guaranteed!
            </p>
            
            {/* Premium Search Bar */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                <SearchBar 
                  placeholder="Search products, brands, categories..."
                  onSearch={handleSearch}
                  size="lg"
                />
              </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Package, value: `${products.length}+`, label: "Products", color: "text-yellow-300", delay: "delay-100" },
                { icon: Shield, value: "100%", label: "Fresh", color: "text-green-300", delay: "delay-200" },
                { icon: Truck, value: "24/7", label: "Available", color: "text-blue-300", delay: "delay-300" },
                { icon: Award, value: "Fast", label: "Delivery", color: "text-orange-300", delay: "delay-400" }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className={`text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 animate-fade-in-scale ${stat.delay}`}>
                    <IconComponent className={`w-8 h-8 ${stat.color} mx-auto mb-3 animate-float`} style={{ animationDelay: `${index * 0.2}s` }} />
                    <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                    <div className="text-sm text-blue-100 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Premium Marketplace */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Luxury Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-float blur-xl"></div>
          <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full animate-float delay-400 blur-xl"></div>
          <div className="absolute top-1/2 right-10 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-float delay-200 blur-xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Exclusive Header with Category Showcase */}
          <div className="text-center mb-20">
            {/* Premium Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-bold mb-8 shadow-lg animate-bounce-in">
              <Crown className="w-5 h-5 mr-2 text-yellow-300" />
              EXCLUSIVE MARKETPLACE
              <Sparkles className="w-5 h-5 ml-2 text-yellow-300 animate-rotate" />
            </div>
            
            {/* Dynamic Title */}
            <div className="mb-6">
              <h2 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                {searchTerm ? (
                  <>🔍 Search Results</>
                ) : (
                  <>🏆 Premium Collection</>
                )}
              </h2>
              <div className="flex items-center justify-center gap-4 text-lg text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">{filteredProducts.length} Products Available</span>
                </div>
                <div className="w-1 h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Premium Quality</span>
                </div>
              </div>
            </div>
          </div>

          {/* Luxury Category Showcase */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Shop by Premium Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "🥛 Dairy", count: "12+", color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50" },
                { name: "🍎 Fresh Fruits", count: "25+", color: "from-red-500 to-orange-500", bgColor: "bg-red-50" },
                { name: "🥬 Vegetables", count: "30+", color: "from-green-500 to-emerald-500", bgColor: "bg-green-50" },
                { name: "🧊 Frozen", count: "18+", color: "from-cyan-500 to-blue-500", bgColor: "bg-cyan-50" },
                { name: "🍞 Bakery", count: "15+", color: "from-amber-500 to-orange-500", bgColor: "bg-amber-50" },
                { name: "🥩 Meat", count: "20+", color: "from-red-600 to-pink-600", bgColor: "bg-red-50" }
              ].map((category, index) => (
                <div 
                  key={index}
                  className={`${category.bgColor} rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-white shadow-lg hover:shadow-xl animate-fade-in-scale`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <span className="text-white font-bold text-lg">{category.name.split(' ')[0]}</span>
                  </div>
                  <div className="font-bold text-gray-800 text-sm">{category.name.split(' ').slice(1).join(' ')}</div>
                  <div className="text-xs text-gray-600 font-medium">{category.count} items</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Premium Search & Filter Bar */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/50 mb-12">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Enhanced Search */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search premium products, brands, categories..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-800 font-medium"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              
              {/* Premium Filters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border border-blue-200">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Sort by:</span>
                  <select className="bg-transparent text-blue-800 font-bold text-sm border-none outline-none">
                    <option>Newest First</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Most Popular</option>
                  </select>
                </div>
                
                <div className="flex bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-1 border-2 border-blue-200">
                  <button className="p-3 bg-white rounded-xl shadow-md text-blue-600 border-2 border-blue-300">
                    <Grid className="w-5 h-5" />
                  </button>
                  <button className="p-3 text-blue-500 hover:text-blue-700 transition-colors">
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Premium Status Indicators */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Inventory</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                <Truck className="w-4 h-4" />
                <span>Same Day Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
                <Award className="w-4 h-4" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                <Crown className="w-4 h-4" />
                <span>Exclusive Collection</span>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-6 bg-gray-100 rounded-full w-fit mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              {searchTerm ? (
                <>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-600 mb-8">
                    No products match your search for "{searchTerm}". Try different keywords or browse all products.
                  </p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mr-4"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Products Available</h3>
                  <p className="text-gray-600 mb-8">We're working on adding new products to our collection.</p>
                </>
              )}
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Back to Home
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product._id} 
                  className={`group animate-fade-in-scale delay-${Math.min(index * 100, 800)}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100 overflow-hidden hover:border-blue-300 hover:-translate-y-2 group-hover:scale-105">
                    <ProductCard product={product} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Section */}
          {filteredProducts.length > 0 && (
            <div className="text-center mt-16">
              <div className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-lg text-gray-600 shadow-sm">
                <Package className="w-5 h-5 mr-2" />
                {searchTerm 
                  ? `Showing ${filteredProducts.length} of ${products.length} products`
                  : `Showing all ${products.length} products`
                }
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Premium Call to Action */}
      <section className="bg-royal-gradient relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-40 h-40 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute bottom-10 right-1/4 w-32 h-32 bg-blue-200/20 rounded-full animate-float delay-400"></div>
          <div className="absolute top-1/2 right-10 w-20 h-20 bg-blue-300/30 rounded-full animate-float delay-200"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <Crown className="w-8 h-8 text-yellow-300 animate-pulse-glow" />
            <h2 className="text-4xl font-bold text-white">Need Help Finding Something?</h2>
            <Crown className="w-8 h-8 text-yellow-300 animate-pulse-glow" />
          </div>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto font-medium">
            Our premium support team is here to help you find the perfect products for your hotel or restaurant. 
            Experience the Hot-Del difference today!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => navigate('/contact')}
              className="px-10 py-4 bg-white text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Contact Support
              </div>
            </button>
            {/* Only show Join as Hotel Partner button if hotel user is not logged in */}
            {!isHotelUserLoggedIn && (
              <button 
                onClick={() => navigate('/hotel-signup')}
                className="px-10 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 rounded-2xl hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Join as Hotel Partner
                </div>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
