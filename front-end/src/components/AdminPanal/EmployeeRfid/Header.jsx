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
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>
      <button
        onClick={onAddClick}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
      >
        <Plus size={18} />
        {addButtonText}
      </button>
    </div>
  );
};

export default Header;