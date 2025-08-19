import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';

const LineManagement = () => {
  const [lineManagementData, setLineManagementData] = useState([
    { id: 1, employeeNo: 'EMP001', unit: 'Unit A', lineNo: 'Line 01', position: 'Operator', status: 'Active', startedDate: '2024-01-15' },
    { id: 2, employeeNo: 'EMP002', unit: 'Unit B', lineNo: 'Line 02', position: 'Supervisor', status: 'Active', startedDate: '2024-02-20' },
    { id: 3, employeeNo: 'EMP003', unit: 'Unit A', lineNo: 'Line 03', position: 'Quality Control', status: 'Active', startedDate: '2024-01-10' },
    { id: 4, employeeNo: 'EMP004', unit: 'Unit C', lineNo: 'Line 01', position: 'Operator', status: 'Inactive', startedDate: '2024-03-05' },
    { id: 5, employeeNo: 'EMP005', unit: 'Unit B', lineNo: 'Line 04', position: 'Technician', status: 'Active', startedDate: '2024-02-28' },
    { id: 6, employeeNo: 'EMP006', unit: 'Unit A', lineNo: 'Line 02', position: 'Operator', status: 'Active', startedDate: '2024-01-25' },
    { id: 7, employeeNo: 'EMP007', unit: 'Unit C', lineNo: 'Line 03', position: 'Supervisor', status: 'Active', startedDate: '2024-03-10' },
    { id: 8, employeeNo: 'EMP008', unit: 'Unit B', lineNo: 'Line 01', position: 'Quality Control', status: 'Active', startedDate: '2024-02-15' }
  ]);
  
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});

  // Line Management functions
  const handleEdit = (row) => {
    setEditingRow(row.id);
    setEditData(row);
  };

  const handleSave = () => {
    setLineManagementData(prev => 
      prev.map(item => item.id === editingRow ? { ...editData } : item)
    );
    setEditingRow(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Line Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium text-gray-700">Employee no</th>
              <th className="text-left p-4 font-medium text-gray-700">Unit</th>
              <th className="text-left p-4 font-medium text-gray-700">Line No</th>
              <th className="text-left p-4 font-medium text-gray-700">Position</th>
              <th className="text-left p-4 font-medium text-gray-700">Status</th>
              <th className="text-left p-4 font-medium text-gray-700">Started date</th>
              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lineManagementData.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  {editingRow === row.id ? (
                    <input
                      type="text"
                      value={editData.employeeNo || ''}
                      onChange={(e) => handleInputChange('employeeNo', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    row.employeeNo
                  )}
                </td>
                <td className="p-4">
                  {editingRow === row.id ? (
                    <select
                      value={editData.unit || ''}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Unit A">Unit A</option>
                      <option value="Unit B">Unit B</option>
                      <option value="Unit C">Unit C</option>
                    </select>
                  ) : (
                    row.unit
                  )}
                </td>
                <td className="p-4">
                  {editingRow === row.id ? (
                    <select
                      value={editData.lineNo || ''}
                      onChange={(e) => handleInputChange('lineNo', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Line 01">Line 01</option>
                      <option value="Line 02">Line 02</option>
                      <option value="Line 03">Line 03</option>
                      <option value="Line 04">Line 04</option>
                    </select>
                  ) : (
                    row.lineNo
                  )}
                </td>
                <td className="p-4">
                  {editingRow === row.id ? (
                    <select
                      value={editData.position || ''}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Operator">Operator</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Quality Control">Quality Control</option>
                      <option value="Technician">Technician</option>
                    </select>
                  ) : (
                    row.position
                  )}
                </td>
                <td className="p-4">
                  {editingRow === row.id ? (
                    <select
                      value={editData.status || ''}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      row.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {row.status}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {editingRow === row.id ? (
                    <input
                      type="date"
                      value={editData.startedDate || ''}
                      onChange={(e) => handleInputChange('startedDate', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    row.startedDate
                  )}
                </td>
                <td className="p-4">
                  {editingRow === row.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(row)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LineManagement;