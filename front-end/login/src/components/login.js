import React, { useState } from 'react';

export default function Login() {
  const [formData, setFormData] = useState({
    position: '',
    id: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Industrial/Manufacturing background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900">
        {/* Geometric patterns representing fabric/textile */}
        <div className="absolute inset-0 opacity-20">
          {/* Grid pattern like fabric weave */}
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Floating elements representing garment pieces */}
        <div className="absolute top-20 left-20 w-16 h-24 bg-blue-400 bg-opacity-20 rounded-t-full blur-sm transform rotate-12"></div>
        <div className="absolute top-32 right-32 w-20 h-16 bg-indigo-400 bg-opacity-25 rounded-lg blur-sm transform -rotate-45"></div>
        <div className="absolute bottom-40 left-40 w-24 h-20 bg-slate-400 bg-opacity-20 rounded-full blur-md transform rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-18 h-32 bg-blue-300 bg-opacity-30 rounded-b-full blur-sm transform -rotate-12"></div>
        
        {/* Subtle animated elements */}
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-2/3 w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <h1 className="text-white text-4xl font-bold underline decoration-2 underline-offset-4">
          zigzag
        </h1>
        <span className="text-white text-lg font-light tracking-widest">
          - SGPTOS -
        </span>
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
            Login
          </h2>

          <div className="space-y-6">
            {/* Position Dropdown */}
            <div className="relative">
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="">Position</option>
                <option value="live_db">Live DB</option>
                <option value="manager">Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="qc">Qulity Control</option>
                <option value="admin">Admin</option>

              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* ID Input */}
            <div>
              <input
                type="text"
                name="id"
                placeholder="ID"
                value={formData.id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-white text-gray-700 font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              Login
            </button>
          </div>

          {/* Bottom Links */}
          <div className="mt-8 text-center space-y-2">
            <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
              Register
            </button>
            <br />
            <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
