import React from 'react';
import { Bell, User, Menu } from 'lucide-react';

const Header = ({ setSidebarOpen }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <button 
          className="lg:hidden text-gray-600 mr-4"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center flex-1 max-w-lg">
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
          <div className="hidden sm:flex items-center space-x-2 cursor-pointer">
            <User className="w-6 h-6 text-gray-600" />
            <span className="text-gray-700">QC name</span>
            <span className="text-gray-500">-SGPTOS-</span>
          </div>
          <div className="sm:hidden">
            <User className="w-6 h-6 text-gray-600 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;