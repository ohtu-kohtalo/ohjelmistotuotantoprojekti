import React from 'react';
import { useState, useEffect } from 'react';

const IndexPage = () => {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold mb-6">Welcome to Your App</h1>
        <p className="text-lg mb-10 max-w-2xl text-center">
          This is your starting point. We’ll gradually migrate all components to Tailwind with reusable building blocks.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition">
          Get Started
        </button>
      </div>
    );
  };
  
  export default IndexPage;