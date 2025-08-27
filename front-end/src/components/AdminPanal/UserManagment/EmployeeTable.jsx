import React from 'react';

const EmployeeTable = ({ columns, data, emptyMessage = "No employees found" }) => {
  return (
    <div className="overflow-x-auto rounded-lg border-gray-200 shadow-sm">
      <table className="w-full table-auto">
        <thead className="border-b border-gray-200">
          <tr >
            {columns.map((column, index) => (      
              <th key={index} className="text-left py-4 px-6 font-medium text-gray-600 uppercase text-sm border-b border-gray-200 whitespace-nowrap">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} 
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors">

                {columns.map((column, colIndex) => (
                  <td key={colIndex} 
                  className={`py-4 px-4 ${column.className || ''}`}>
                    {column.render ? column.render(row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                <div className="text-xl font-medium mb-2">No employees found</div>
                <div className="text-sm">{emptyMessage}</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;