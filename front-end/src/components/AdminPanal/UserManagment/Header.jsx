import React from 'react';

const Header = ({ icon }) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white shadow-lg">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-200 shadow-md">
            <div className="text-white">
              {icon}
            </div>
          </div>
        )}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage your system users and permissions
          </p>
        </div>
      </div>
      </div>
  );
};

export default Header;