import React from 'react';
import { ChevronDown } from 'lucide-react';

const StatusBadge = ({ status, onChange, options = ['ACTIVE', 'INACTIVE'] }) => {
  const getStatusStyles = (currentStatus) => {
    switch (currentStatus) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={`appearance-none border-0 rounded-full px-3 py-1 text-sm font-medium cursor-pointer transition-colors ${getStatusStyles(status)}`}
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
    </div>
  );
};

export default StatusBadge;