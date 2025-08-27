import React from 'react';

const SearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedDepartment, // Changed from selectedDepartments (array)
  setSelectedDepartment  // Changed from setSelectedDepartments
}) => {
  const departments = ['All Departments', 'IT', 'HR', 'Finance', 'Marketing'];

  return (
    <div className="flex gap-4 mb-6">
      <input
        type="text"
        placeholder="Search employees..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <select
        value={selectedDepartment} // Changed from selectedDepartments
        onChange={(e) => setSelectedDepartment(e.target.value)}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SearchFilter;