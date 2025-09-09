import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const FilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  filters = [], 
  searchPlaceholder = "Search..." 
}) => {
  return (
    <div className="p-6 border-b bg-gray-50">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors"
          />
        </div>
        
        {filters.map((filter, index) => (
          <div key={index} className="relative">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
            >
              {filter.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;