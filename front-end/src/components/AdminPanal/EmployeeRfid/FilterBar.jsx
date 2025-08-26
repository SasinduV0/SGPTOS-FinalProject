import React from 'react';
import { Search} from 'lucide-react';

const FilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  searchPlaceholder = "Search..." 
}) => {
  return (
    <div className="p-6 border-b bg-gray-50">
      <div className="flex items-center gap-4">

        <div className="relative">
          
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-80 pr-4 py-2 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;