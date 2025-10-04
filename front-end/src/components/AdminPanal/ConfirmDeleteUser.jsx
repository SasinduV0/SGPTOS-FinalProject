import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmDeleteUser = ({ isOpen, onClose, onConfirm, employee }) => {
  const [inputEmployeeId, setInputEmployeeId] = useState("");
  const [inputRole, setInputRole] = useState("");
  const [errors, setErrors] = useState({});

  const handleDelete = () => {
    const newErrors = {};

    if (inputEmployeeId.trim() !== employee.empId) {
      newErrors.employeeId = "Employee ID does not match. Please try again.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onConfirm();
      setInputEmployeeId("");
      setErrors({});
    }
  };

  const handleClose = () => {
    setInputEmployeeId("");
    setErrors({});
    onClose();
  };

  const handleInputChange = (field, value) => {
    if (field === 'employeeId') {
      setInputEmployeeId(value);
      if (errors.employeeId) {
        setErrors(prev => ({ ...prev, employeeId: '' }));
      }
    } 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        
        {/* Header */}
        <div className="flex items-center mb-4">
          <AlertTriangle className="text-red-600 mr-3" size={24} />
          <h3 className="text-lg font-semibold text-red-600">Delete User Account</h3>
        </div>

        {/* Employee Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600">You are about to delete:</p>
          <p className="font-medium text-gray-900">
            {employee.firstName} {employee.lastName}
          </p>
          <div className="grid grid-cols-1 gap-1 mt-2 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Department:</span> {employee.section}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Employee ID:</span> {employee.empId}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Current Role:</span> <span className="font-semibold text-blue-600">{employee.role}</span>
            </p>
          </div>
        </div>

        {/* Warning */}
        <p className="text-gray-600 mb-4">
          This action cannot be undone. This will permanently delete the user account and remove all associated data.
        </p>

        {/* Confirmation Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Employee ID to confirm: <span className="font-mono font-semibold text-red-600">{employee.empId}</span>
            </label>
            <input
              type="text"
              value={inputEmployeeId}
              onChange={(e) => handleInputChange('employeeId', e.target.value)}
              placeholder="Type Employee ID here"
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-colors ${
                errors.employeeId
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.employeeId && (
              <p className="text-sm text-red-500 mt-1">{errors.employeeId}</p>
            )}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              inputEmployeeId
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleDelete}
            disabled={!inputEmployeeId}
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteUser;