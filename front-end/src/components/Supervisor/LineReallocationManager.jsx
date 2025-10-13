import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ArrowRight, Check, X, Shuffle } from 'lucide-react';

const API_URL = "http://localhost:8001/api/linereallocation";
const socket = io("http://localhost:8001");

// --- Reusable Modal Component (kept inside for encapsulation) ---
const ReallocationModal = ({ employee, isOpen, onClose, onConfirm }) => {
  const [newLine, setNewLine] = useState('');

  useEffect(() => {
    if (employee) {
      setNewLine(employee.newLineNo?.[0] || '');
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleConfirm = () => {
    if (newLine && !isNaN(newLine)) {
      onConfirm(employee._id, parseInt(newLine, 10));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Reallocate Employee</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <div className="mb-4">
          <p><span className="font-semibold">Employee:</span> {employee.name}</p>
          <p><span className="font-semibold">Current Line:</span> {employee.lineNo}</p>
        </div>
        <div>
          <label htmlFor="newLine" className="block text-sm font-medium text-gray-700 mb-1">New Line Number</label>
          <input
            type="number"
            id="newLine"
            value={newLine}
            onChange={(e) => setNewLine(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter new line number"
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"><Check size={18} /> Confirm</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Reusable Component ---
const LineReallocationManager = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [reallocatedEmployees, setReallocatedEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allRes, reallocatedRes] = await Promise.all([
          axios.get(API_URL),
          axios.get(`${API_URL}/reallocated`)
        ]);
        setAllEmployees(allRes.data);
        setReallocatedEmployees(reallocatedRes.data);
      } catch (err) {
        setError("Failed to fetch employee data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    socket.on("reallocationUpdate", (data) => setAllEmployees(data));
    socket.on("reallocatedEmployeesUpdate", (data) => setReallocatedEmployees(data));

    return () => {
      socket.off("reallocationUpdate");
      socket.off("reallocatedEmployeesUpdate");
    };
  }, []);

  const handleOpenModal = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };

  const handleConfirmReallocation = async (id, newLineNo) => {
    try {
      await axios.put(`${API_URL}/${id}`, { newLineNo: [newLineNo] });
    } catch (err) {
      setError("Failed to update reallocation.");
    } finally {
      handleCloseModal();
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <ReallocationModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmReallocation}
      />
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Shuffle className="text-blue-600" />
        Line Reallocation
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Employees Table */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Available Employees</h3>
          <div className="overflow-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Line</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allEmployees.map((emp) => (
                  <tr key={emp._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{emp.lineNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button onClick={() => handleOpenModal(emp)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold px-3 py-1 rounded-md text-xs">Reallocate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reallocated Employees List */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Recently Reallocated</h3>
          <ul className="space-y-3 max-h-96 overflow-auto">
            {reallocatedEmployees.length > 0 ? (
              reallocatedEmployees.map((emp) => (
                <li key={emp._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <p className="font-semibold text-gray-800">{emp.name}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{emp.lineNo}</span>
                    <ArrowRight size={16} className="text-gray-400" />
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{emp.newLineNo[0]}</span>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500 mt-4">No reallocations yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LineReallocationManager;