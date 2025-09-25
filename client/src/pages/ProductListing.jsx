import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CategorySelector from '../components/CategorySelector';
import ProductCard from '../components/ProductCard';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Debounce search term with focus preservation
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');

    if (category) setSelectedCategory(category);
    if (search) setSearchTerm(search);
    if (sort) setSortBy(sort);
    if (order) setSortOrder(order);
  }, [searchParams]);

  // Single useEffect for all product fetching
  useEffect(() => {
    const fetchProducts = async () => {
      // Only show loading on initial load (when products array is empty)
      if (products.length === 0 && !debouncedSearchTerm && !selectedCategory) {
        setLoading(true);
      }
      setError('');

      try {
        let url = 'http://localhost:3000/api/products/?';
        const params = new URLSearchParams();

        if (selectedCategory) {
          params.append('category', selectedCategory);
        }
        if (debouncedSearchTerm) {
          params.append('search', debouncedSearchTerm);
        }
        if (sortBy) {
          params.append('sortBy', sortBy);
        }
        if (sortOrder) {
          params.append('order', sortOrder);
        }

        url += params.toString();
        const response = await axios.get(url);
        setProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, debouncedSearchTerm, sortBy, sortOrder, products.length]);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSearchInputChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set('search', searchTerm.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  }, [searchTerm, searchParams, setSearchParams]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSort = useCallback((field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', field);
    newParams.set('order', newOrder);
    setSearchParams(newParams);
  }, [sortBy, sortOrder, searchParams, setSearchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex py-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                Home
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {selectedCategory || 'All Products'}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {selectedCategory ? `${selectedCategory}` : 'All Products'}
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Discover our premium collection of {products.length} products
          </p>
        </div>

        {/* Professional Search and Filter Bar */}
        <div className="bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm shadow-xl border border-white/20 rounded-2xl mb-8 overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Enhanced Search Section */}
              <div className="flex-1 max-w-2xl">
                <div className="relative group">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                      {/* Search Icon */}
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      
                      {/* Search Input */}
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search for products, brands, categories..."
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        className="block w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl leading-6 bg-white/80 backdrop-blur-sm placeholder-gray-400 shadow-sm transition-all duration-300 ease-in-out focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white focus:shadow-lg hover:border-gray-300 hover:shadow-md"
                      />
                      
                      {/* Clear Button */}
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Search Button */}
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      Search
                    </button>
                  </form>
                  
                  {/* Search Enhancement Indicator */}
                  <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full"></div>
                </div>
              </div>

              {/* Professional Sort and Results Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                {/* Sort Dropdown */}
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Sort by:</label>
                  <div className="relative">
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field] = e.target.value.split('-');
                        handleSort(field);
                      }}
                      className="appearance-none bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 cursor-pointer"
                    >
                      <option value="createdAt-desc">✨ Newest First</option>
                      <option value="price-asc">💰 Price: Low to High</option>
                      <option value="price-desc">💎 Price: High to Low</option>
                      <option value="name-asc">🔤 Name: A-Z</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Results Counter */}
                <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">
                    {products.length} {products.length === 1 ? 'result' : 'results'}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Search Indicator */}
            {searchTerm && (
              <div className="mt-4 flex items-center justify-between bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">
                    Searching for: <span className="font-semibold">"{searchTerm}"</span>
                  </span>
                </div>
                <button
                  onClick={handleClearSearch}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Selector */}
        <CategorySelector
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 mb-16">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filters'
                : 'No products are available at the moment'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8 mb-16">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;
