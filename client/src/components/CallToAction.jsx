import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CallToAction = () => {
  const { user } = useAuth();
  
  // Check if user is logged in and is a hotel user
  const isHotelUserLoggedIn = user && user.role === 'hotel';

  // Don't render the entire section if hotel user is logged in
  if (isHotelUserLoggedIn) {
    return null;
  }

  return (
    <section className="bg-blue-100 py-20 px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-extrabold mb-4 text-gray-800">Get Started with <span className="text-blue-700">Hot-Del</span></h2>
        <p className="mb-8 text-lg text-gray-700">
          Create an account and start ordering premium dairy & frozen products today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/hotelsignup"
            className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition duration-300"
          >
            Hotel Signup
          </Link>
          <Link
            to="/sellersignup"
            className="bg-white border border-black px-8 py-3 rounded-full hover:bg-gray-100 transition duration-300"
          >
            Become a Seller
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
