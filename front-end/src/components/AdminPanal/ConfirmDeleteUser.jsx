import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmDeleteUser = ({ isOpen, onClose, onConfirm, user }) => { // Make sure parameter is 'user'
  const [inputUserID, setInputUserID] = useState("");
  const [errors, setErrors] = useState({});

  const handleDelete = () => {
    const newErrors = {};

    if (inputUserID.trim() !== user?.userID) { // Use optional chaining for safety
      newErrors.userID = "User ID does not match. Please try again.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onConfirm();
      setInputUserID("");
      setErrors({});
    }
  };

  const handleClose = () => {
    setInputUserID("");
    setErrors({});
    onClose();
  };

  const handleInputChange = (field, value) => {
    if (field === 'userID') {
      setInputUserID(value);
      if (errors.userID) {
        setErrors(prev => ({ ...prev, userID: '' }));
      }
    }
  };

  // Add safety checks - don't render if modal is closed or user is undefined
  if (!isOpen || !user) return null; 

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        
        {/* Header */}
        <div className="flex items-center mb-4">
          <AlertTriangle className="text-red-600 mr-3" size={24} />
          <h3 className="text-lg font-semibold text-red-600">Delete User Account</h3>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600">You are about to delete:</p>
          <p className="font-medium text-gray-900">
            {user.firstname || 'N/A'} {user.lastname || 'N/A'}
          </p>
          <div className="grid grid-cols-1 gap-1 mt-2 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Department:</span> {user.department || 'N/A'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">User ID:</span> {user.userID || 'N/A'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Username:</span> {user.username || 'N/A'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Current Role:</span> <span className="font-semibold text-blue-600">{user.role || 'N/A'}</span>
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
              Enter User ID to confirm: <span className="font-mono font-semibold text-red-600">{user.userID || 'N/A'}</span>
            </label>
            <input
              type="text"
              value={inputUserID}
              onChange={(e) => handleInputChange('userID', e.target.value)}
              placeholder="Type User ID here"
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-colors ${
                errors.userID
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.userID && (
              <p className="text-sm text-red-500 mt-1">{errors.userID}</p>
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
              inputUserID
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleDelete}
            disabled={!inputUserID}
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteUser;