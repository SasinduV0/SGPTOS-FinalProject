import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from localStorage and decode it
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.user);
      } catch (error) {
        console.error('Invalid token:', error);
        // If token is invalid, remove it and redirect to login
        localStorage.removeItem('token');
        navigate('/'); // Updated to match your ProtectedRoute redirect
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // Updated to match your ProtectedRoute redirect
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      supervisor: 'bg-green-100 text-green-800 border-green-200',
      qc: 'bg-purple-100 text-purple-800 border-purple-200',
      'live-dashboard': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleDisplayName = (role) => {
    const displayNames = {
      admin: 'Administrator',
      manager: 'Manager',
      supervisor: 'Supervisor',
      qc: 'Quality Control',
      'live-dashboard': 'Live Dashboard'
    };
    return displayNames[role] || role;
  };

  if (!user) {
    return null; // Don't render navbar if user is not logged in
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-800">
                Smart Garment System
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaUser className="text-gray-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {user.userID}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;