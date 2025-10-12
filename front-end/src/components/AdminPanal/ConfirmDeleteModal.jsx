import React, { useState } from "react";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, rfidNumber, entityType="employee" }) => {
  const [inputRfid, setInputRfid] = useState("");
  const [error, setError] = useState("");

  const getTitle= () => {
    switch(entityType.toLowerCase())
    {
        case 'product':
            return "Delete this Product RFID?";
        case 'employee':
            return "Delete this Employee RFID?";
        default:
            return "Delete this item?";
    }
  };

  const getDescription = () => {
    switch(entityType.toLowerCase()) {
      case 'product':
        return "This action cannot be undone. This will permanently delete this product RFID.";
      case 'employee':
        return "This action cannot be undone. This will permanently delete this employee RFID.";
      default:
        return "This action cannot be undone. This will permanently delete this item.";
    }
  };

  const handleDelete = () => {
    if (inputRfid.trim() !== rfidNumber) {
      setError("RFID number does not match. Please try again.");
      return;
    }
    onConfirm(); 
    setInputRfid("");
    setError("");
  };

  const handleClose = () => {
    setInputRfid("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center backdrop-blur bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-2">{getTitle()}</h3>
        <p className="mt-2 text-gray-600 mb-4">
          {getDescription()}
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter RFID number to confirm: <strong>{rfidNumber}</strong>
          </label>
          <input
            type="text"
            value={inputRfid}
            onChange={(e) => {
              setInputRfid(e.target.value);
              setError("");
            }}
            placeholder="Type RFID here"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;