import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormField from './FormField';

const RfidModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    rfidNumber: '',
    empName: '',
    empId: '',
    status: 'ACTIVE'
  });

  const [errors, setErrors] = useState({});


  useEffect(() => {
    if (initialData) {
      setFormData({
        rfidNumber: initialData.rfidNumber,
        empName: initialData.empName,
        empId: initialData.empId,
        status: initialData.status
      });
    } else {
      setFormData({
        rfidNumber: '',
        empName: '',
        empId: '',
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

    if (!formData.empName) {
      newErrors.empName = 'Unit is required';
    }

    if (!formData.empId) {
      newErrors.empId = 'Workplace is required';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit RFID Entry' : 'Add New RFID Entry'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="RFID Number"
          type="text"
          value={formData.rfidNumber}
          onChange={(value) => handleInputChange('rfidNumber', value)}
          placeholder="e.g. RFID01-234"
          required
          error={errors.rfidNumber}
        />

        <FormField
          label="Employee Name"
          type="text"
          value={formData.empName}
          onChange={(value) => handleInputChange('empName', value)}
          required
          error={errors.empName}
        />

        <FormField
          label="Employee ID"
          type="text"
          value={formData.empId}
          onChange={(value) => handleInputChange('empId', value)}
          required
          error={errors.empId}
        />

        <FormField
          label="Status"
          type="select"
          value={formData.status}
          onChange={(value) => handleInputChange('status', value)}
          options={['ACTIVE', 'INACTIVE']}
        />

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
    </Modal>
  );
};

export default RfidModal;