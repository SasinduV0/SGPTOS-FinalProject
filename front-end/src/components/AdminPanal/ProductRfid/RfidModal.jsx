import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

const RFIDModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    rfidNumber: '',
    unit: '',
    workplace: '',
    status: 'ACTIVE'
  });

  const [errors, setErrors] = useState({});

  const units = ['UNIT 1', 'UNIT 2', 'UNIT 3'];
  const workplaces = ['LINE 1', 'LINE 2', 'LINE 3', 'LINE 4'];

  useEffect(() => {
    if (initialData) {
      setFormData({
        rfidNumber: initialData.rfidNumber,
        unit: initialData.unit,
        workplace: initialData.workplace,
        status: initialData.status
      });
    } else {
      setFormData({
        rfidNumber: '',
        unit: '',
        workplace: '',
        status: 'ACTIVE'
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rfidNumber.trim()) {
      newErrors.rfidNumber = 'RFID Number is required';
    } else if (formData.rfidNumber.length < 5) {
      newErrors.rfidNumber = 'RFID Number must be at least 5 characters';
    }

    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.workplace) {
      newErrors.workplace = 'Workplace is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {initialData ? 'Edit RFID Entry' : 'Add New RFID Entry'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* RFID Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RFID Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.rfidNumber}
              onChange={(e) => handleInputChange('rfidNumber', e.target.value)}
              placeholder="e.g. RFID01-234"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.rfidNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.rfidNumber && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.rfidNumber}
              </p>
            )}
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className={`w-full appearance-none px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 cursor-pointer transition-colors ${
                  errors.unit ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Unit</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {errors.unit && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.unit}
              </p>
            )}
          </div>

          {/* Workplace */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workplace <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.workplace}
                onChange={(e) => handleInputChange('workplace', e.target.value)}
                className={`w-full appearance-none px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 cursor-pointer transition-colors ${
                  errors.workplace ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Workplace</option>
                {workplaces.map(workplace => (
                  <option key={workplace} value={workplace}>{workplace}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {errors.workplace && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.workplace}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="relative">
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 cursor-pointer transition-colors"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {initialData ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RFIDModal;