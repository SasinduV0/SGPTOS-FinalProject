import React from 'react';
import ActionButton from './ActionButton';

const DataTable = ({ columns, data, emptyMessage = "No data found" }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">   {/*Render table*/}
        <thead>
          <tr className="border-b border-gray-200">

            {/* Map through columns array to create table headers */}
            {columns.map((column, index) => (      
              <th key={index} className="text-left py-3 px-4 font-medium text-gray-600 uppercase text-sm">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>

          {/* Conditional rendering based on data availability */}
          {data.length > 0 ? (
            // Map through data array to create table rows
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">

                {/* Map through columns to create table cells */}
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`py-4 px-4 ${column.className || ''}`}>

                    {/* Render custom content if provided, otherwise show raw data */}
                    {column.render ? column.render(row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (

            // Empty state message when no data is available
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                <div className="text-lg mb-2">No data found</div>
                <div className="text-sm">{emptyMessage}</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;