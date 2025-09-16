import React from 'react';
import { Search } from 'lucide-react';

const FilterBar = ({
  selectedOption, // Changed from selectedDepartments (array)
  setSelectedOption,  // Changed from setSelectedDepartments
  searchPlaceholder= 'Search...',
  options = [],
  selectLabel = 'Filter'
    }) => {

  return (
    <div className="p-6 border-b bg-gray-50">
      <div className="flex items-center gap-4">

          {options.length > 0 && (
            <div>
              <label className='mr-2 text-gray-700 font-medium'> {selectLabel}: </label>

              <select
                value={selectedOption}
                onChange={e => setSelectedOption(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white'>

                  {options.map( opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
            </div>
          )}
        </div>
      </div>

  );
};

export default FilterBar;