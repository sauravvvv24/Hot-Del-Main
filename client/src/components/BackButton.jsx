import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ 
  onClick, 
  className = "", 
  size = "md",
  variant = "default"
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1); // Default behavior: go back
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const variants = {
    default: "bg-gray-600 hover:bg-gray-700 text-white",
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]} 
        ${variants[variant]}
        rounded-lg 
        flex items-center justify-center 
        transition-all duration-200 
        hover:scale-105 
        focus:outline-none 
        focus:ring-2 
        focus:ring-offset-2 
        focus:ring-gray-500
        shadow-sm
        ${className}
      `}
      title="Go back"
    >
      <ArrowLeft className={iconSizes[size]} />
    </button>
  );
};

export default BackButton;
