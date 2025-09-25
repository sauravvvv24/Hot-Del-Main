import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCT_CATEGORIES, CATEGORY_DISPLAY_NAMES, CATEGORY_ICONS } from '../constants/categories';

const CategorySelector = ({ selectedCategory, onCategorySelect, showAll = true }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    } else {
      // Navigate to category page
      navigate(`/products/category/${category}`);
    }
  };

  const handleAllClick = () => {
    if (onCategorySelect) {
      onCategorySelect('');
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="mb-12">
      {/* Professional Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Shop by Category
        </h2>
        <p className="text-gray-600 text-lg">Discover products tailored to your needs</p>
      </div>

      {/* Professional Category Grid */}
      <div className="bg-gradient-to-r from-white via-blue-50/20 to-purple-50/20 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {showAll && (
            <div
              onClick={handleAllClick}
              className={`group cursor-pointer rounded-2xl p-6 text-center transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                !selectedCategory 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/25 text-white' 
                  : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:bg-white text-gray-700'
              }`}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                !selectedCategory 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-600 group-hover:shadow-lg'
              }`}>
                <svg className={`w-8 h-8 ${!selectedCategory ? 'text-white' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className={`text-sm font-bold ${!selectedCategory ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                All Products
              </p>
              {!selectedCategory && (
                <div className="mt-2 w-full h-1 bg-white/30 rounded-full">
                  <div className="h-full bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          )}
          
          {PRODUCT_CATEGORIES.map((category) => (
            <div
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`group cursor-pointer rounded-2xl p-6 text-center transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                selectedCategory === category 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/25 text-white' 
                  : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:bg-white text-gray-700'
              }`}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden transition-all duration-300 ${
                selectedCategory === category 
                  ? 'ring-4 ring-white/30 shadow-lg' 
                  : 'ring-2 ring-gray-200 group-hover:ring-blue-400 group-hover:shadow-lg'
              }`}>
                <img
                  src={CATEGORY_ICONS[category]}
                  alt={CATEGORY_DISPLAY_NAMES[category]}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/64/cccccc/666666?text=' + category.charAt(0);
                  }}
                />
              </div>
              <p className={`text-sm font-bold transition-colors duration-300 ${
                selectedCategory === category 
                  ? 'text-white' 
                  : 'text-gray-700 group-hover:text-gray-900'
              }`}>
                {CATEGORY_DISPLAY_NAMES[category]}
              </p>
              {selectedCategory === category && (
                <div className="mt-2 w-full h-1 bg-white/30 rounded-full">
                  <div className="h-full bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Category Stats */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              {PRODUCT_CATEGORIES.length + (showAll ? 1 : 0)} categories available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySelector; 