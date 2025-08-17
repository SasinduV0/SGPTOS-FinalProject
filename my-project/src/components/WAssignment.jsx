import React, { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';

const DashboardBody = () => {
  const [selectedLine, setSelectedLine] = useState('Line 1');
  const [isLineDropdownOpen, setIsLineDropdownOpen] = useState(false);
  const [openOperationDropdown, setOpenOperationDropdown] = useState(null);

  const lines = ['Line 1', 'Line 2', 'Line 3', 'Line 4'];
  
  const operations = [
    'Operation A', 'Operation B', 'Operation C', 
    'Operation D', 'Operation E', 'Operation F', 
    'Operation G', 'Operation H'
  ];

  const [workers, setWorkers] = useState([
    { id: 1, name: 'Name 1', workerId: '101', operation: 'Operation A' },
    { id: 2, name: 'Name 2', workerId: '102', operation: 'Operation B' },
    { id: 3, name: 'Name 3', workerId: '103', operation: 'Operation C' },
    { id: 4, name: 'Name 4', workerId: '104', operation: 'Operation D' },
    { id: 5, name: 'Name 5', workerId: '105', operation: 'Operation E' },
    { id: 6, name: 'Name 6', workerId: '106', operation: 'Operation F' },
    { id: 7, name: 'Name 7', workerId: '107', operation: 'Operation G' },
    { id: 8, name: 'Name 8', workerId: '108', operation: 'Operation H' },
  ]);

  const handleLineSelect = (line) => {
    setSelectedLine(line);
    setIsLineDropdownOpen(false);
  };

  const handleOperationChange = (workerId, newOperation) => {
    setWorkers(workers.map(worker => 
      worker.id === workerId 
        ? { ...worker, operation: newOperation }
        : worker
    ));
    setOpenOperationDropdown(null);
  };

  const toggleOperationDropdown = (workerId) => {
    setOpenOperationDropdown(
      openOperationDropdown === workerId ? null : workerId
    );
  };

  return (
    <div className="flex-1 bg-white p-8">
      {/* Select Line Section */}
      <div className="mb-8">
        <div className="flex items-center">
          <span className="text-base font-medium text-gray-800 mr-4">
            Select Line:
          </span>
          <div className="relative">
            <button
              onClick={() => setIsLineDropdownOpen(!isLineDropdownOpen)}
              className="inline-flex items-center justify-between gap-3 bg-white border border-gray-300 rounded px-4 py-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:border-blue-500 min-w-[120px]"
            >
              {selectedLine}
              <ChevronDown size={16} className={`transition-transform ${isLineDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Line Dropdown */}
            {isLineDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg z-10">
                {lines.map((line) => (
                  <button
                    key={line}
                    onClick={() => handleLineSelect(line)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 focus:bg-blue-50"
                  >
                    {line}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-16">
                  
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Worker Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Worker ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Operation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                  {/* First Column - Worker Avatar */}
                  <td className="px-6 py-4">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                      <User size={18} className="text-gray-500" />
                    </div>
                  </td>

                  {/* Worker Name */}
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {worker.name}
                  </td>

                  {/* Worker ID */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {worker.workerId}
                  </td>

                  {/* Operation Dropdown */}
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => toggleOperationDropdown(worker.id)}
                        className="inline-flex items-center justify-between gap-2 text-blue-600 hover:text-blue-700 focus:outline-none font-medium text-sm min-w-[120px]"
                      >
                        {worker.operation}
                        <ChevronDown size={14} className={`transition-transform text-gray-400 ${openOperationDropdown === worker.id ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Operation Dropdown Menu */}
                      {openOperationDropdown === worker.id && (
                        <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-300 rounded shadow-lg z-20">
                          {operations.map((operation) => (
                            <button
                              key={operation}
                              onClick={() => handleOperationChange(worker.id, operation)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 transition-colors ${
                                worker.operation === operation 
                                  ? 'bg-blue-50 text-blue-700 font-medium' 
                                  : 'text-gray-700'
                              }`}
                            >
                              {operation}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardBody;