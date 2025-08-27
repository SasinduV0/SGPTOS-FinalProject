import React from 'react';
import { Plus } from 'lucide-react';

const Header = ({ title, onAddClick, addButtonText = "Add Entry", icon }) => {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            {icon}
          </div>
        )}
        <h1 className="text-xl font-semibold text-gray-800">User Managment</h1>
      </div>
    </div>
  );
};

export default Header;