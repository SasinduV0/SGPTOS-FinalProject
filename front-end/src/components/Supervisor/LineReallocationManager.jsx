import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ArrowRight, Check, X, Shuffle, Users, RefreshCw } from 'lucide-react';

const EMPLOYEE_API_URL = "http://localhost:8001/api/employees";
const REALLOCATION_API_URL = "http://localhost:8001/api/linereallocation";
const socket = io("http://localhost:8001");

// --- Reusable Modal Component ---
const ReallocationModal = ({ employee, isOpen, onClose, onConfirm }) => {
  const [newLine, setNewLine] = useState('');

  useEffect(() => {
    if (employee) {
      setNewLine('');
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleConfirm = () => {
    if (newLine && !isNaN(newLine) && parseInt(newLine, 10) > 0) {
      onConfirm(employee, parseInt(newLine, 10));
    } else {
      alert('Please enter a valid line number');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Reallocate Employee</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="mb-4 bg-gray-50 p-4 rounded-lg">
          <p className="mb-2">
            <span className="font-semibold text-gray-700">Employee ID:</span> 
            <span className="ml-2 text-gray-900">{employee.employeeId}</span>
          </p>
          <p className="mb-2">
            <span className="font-semibold text-gray-700">Name:</span> 
            <span className="ml-2 text-gray-900">{employee.name}</span>
          </p>
          <p>
            <span className="font-semibold text-gray-700">Current Line:</span> 
            <span className="ml-2 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              Line {employee.line}
            </span>
          </p>
        </div>
        <div>
          <label htmlFor="newLine" className="block text-sm font-medium text-gray-700 mb-2">
            New Line Number
          </label>
          <input
            type="number"
            id="newLine"
            value={newLine}
            onChange={(e) => setNewLine(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter new line number"
            min="1"
            max="10"
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Check size={18} /> Confirm Reallocation
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
const LineReallocationManager = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [reallocatedEmployees, setReallocatedEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch all employees from Employee collection
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const employeesRes = await axios.get(EMPLOYEE_API_URL);
      console.log("✅ Fetched employees:", employeesRes.data);
      setAllEmployees(employeesRes.data);
      
      // Fetch reallocated employees
      const reallocatedRes = await axios.get(`${REALLOCATION_API_URL}/reallocated`);
      console.log("✅ Fetched reallocated employees:", reallocatedRes.data);
      setReallocatedEmployees(reallocatedRes.data);
      
    } catch (err) {
      console.error("❌ Error fetching employee data:", err);
      setError("Failed to fetch employee data. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();

    // Listen for real-time updates
    socket.on("reallocationUpdate", (data) => {
      console.log("🔄 Received reallocation update");
      fetchEmployees(); // Refresh both lists
    });

    socket.on("reallocatedEmployeesUpdate", (data) => {
      console.log("🔄 Received reallocated employees update");
      setReallocatedEmployees(data);
    });

    // Also listen for employee updates
    socket.on("rfidUpdate", fetchEmployees);
    socket.on("employeeUpdate", fetchEmployees);

    return () => {
      socket.off("reallocationUpdate");
      socket.off("reallocatedEmployeesUpdate");
      socket.off("rfidUpdate");
      socket.off("employeeUpdate");
    };
  }, []);

  const handleOpenModal = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
    setSuccessMessage('');
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };

  const handleConfirmReallocation = async (employee, newLineNo) => {
    try {
      setError(null);
      
      // Create reallocation record
      const reallocationData = {
        EmployeeID: employee.employeeId,
        name: employee.name,
        lineNo: employee.line,
        newLineNo: [newLineNo]
      };
      
      console.log("📤 Sending reallocation data:", reallocationData);
      
      // Save to LineReallocation collection
      await axios.post(REALLOCATION_API_URL, reallocationData);
      
      // Update the actual employee's line number in Employee collection
      await axios.put(`${EMPLOYEE_API_URL}/${employee.employeeId}`, {
        name: employee.name,
        line: newLineNo,
        pcs: employee.pcs
      });
      
      console.log("✅ Employee reallocated successfully");
      setSuccessMessage(`${employee.name} successfully moved from Line ${employee.line} to Line ${newLineNo}`);
      
      // Refresh data
      await fetchEmployees();
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        handleCloseModal();
        setSuccessMessage('');
      }, 1500);
      
    } catch (err) {
      console.error("❌ Error during reallocation:", err);
      setError(`Failed to reallocate employee: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mr-3" />
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <ReallocationModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmReallocation}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Shuffle className="text-blue-600" />
          Line Reallocation Management
        </h2>
        <button
          onClick={fetchEmployees}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Check className="text-green-600" />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <X className="text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Employees Table */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <Users size={20} />
              All Employees ({allEmployees.length})
            </h3>
          </div>
          <div className="overflow-auto max-h-96 border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Line
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PCS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allEmployees.length > 0 ? (
                  allEmployees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">
                        {emp.employeeId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {emp.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          Line {emp.line}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-semibold">
                        {emp.pcs || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleOpenModal(emp)}
                          className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold px-3 py-1.5 rounded-md text-xs transition-colors"
                        >
                          Reallocate
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reallocated Employees List */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Recently Reallocated ({reallocatedEmployees.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-auto">
            {reallocatedEmployees.length > 0 ? (
              reallocatedEmployees.map((emp) => (
                <div key={emp._id} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <p className="font-semibold text-gray-800 mb-2">{emp.name}</p>
                  <p className="text-xs text-gray-500 mb-2">ID: {emp.EmployeeID}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                      Line {emp.lineNo}
                    </span>
                    <ArrowRight size={16} className="text-gray-400" />
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                      Line {emp.newLineNo[0]}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <Shuffle className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm">No reallocations yet.</p>
                <p className="text-xs text-gray-400 mt-1">Reallocated employees will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineReallocationManager;