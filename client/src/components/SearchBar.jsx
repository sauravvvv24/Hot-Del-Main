// components/SearchBar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const SearchBar = ({ 
  placeholder = "Search products, brands, categories...", 
  onSearch, 
  className = "",
  size = "md" 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-4 text-base", 
    lg: "py-4 px-6 text-lg"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    if (onSearch) {
      // If onSearch prop is provided, use it (for local filtering)
      onSearch(searchTerm.trim());
    } else {
      // Otherwise, navigate to search page
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative group">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
        </div>
        
        {/* Search Input */}
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`
            block w-full pl-10 pr-20 border-2 border-gray-200 rounded-xl 
            bg-white/90 backdrop-blur-sm placeholder-gray-400 shadow-sm 
            transition-all duration-300 ease-in-out 
            focus:outline-none focus:placeholder-gray-300 focus:ring-2 
            focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white 
            focus:shadow-lg hover:border-gray-300 hover:shadow-md
            ${sizeClasses[size]}
          `}
        />
        
        {/* Clear Button */}
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-12 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {/* Search Button */}
        <button
          type="submit"
          disabled={!searchTerm.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-lg font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
