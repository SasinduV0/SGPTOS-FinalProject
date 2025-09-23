import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormField from './FormField';

const RfidModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    rfidNumber: '',
    empName: '',
    empId: '',
    status: 'ACTIVE',
    department: '',
    phoneNumber: '',
    email: ''
  });

  const [errors, setErrors] = useState({});

  //Department options
  const departmentOptions = [
    'Quality control',
    'Cutting',
    'sewing',
    'Finishing',
    'Packing',
  ]

  useEffect(() => {
    if (initialData) {
      setFormData({
        rfidNumber: initialData.rfidNumber || '',
        empName: initialData.empName || '',
        empId: initialData.empId || '',
        status: initialData.status || 'ACTIVE',
        department: initialData.department || '',
        phoneNumber: initialData.phoneNumber || '',
        email: initialData.email || ''
      });
    } else {
      setFormData({
        rfidNumber: '',
        empName: '',
        empId: '',
        status: 'ACTIVE',
        department: '',
        phoneNumber: '',
        email: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rfidNumber.trim()) {
      newErrors.rfidNumber = 'RFID Number is required';
    } else if (formData.rfidNumber.length < 3) {
      newErrors.rfidNumber = 'RFID Number must be at least 3 characters';
    }

    if (!formData.empName.trim()) {
      newErrors.empName = 'Employee Name is required';
    }

    if (!formData.empId.trim()) {
      newErrors.empId = 'Employee ID is required';
    }

    // Email validation if provided
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Submitting form data:', formData);
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
      title={initialData ? 'Edit RFID Employee' : 'Add New RFID Employee'}
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
          placeholder="Enter employee name"
          required
          error={errors.empName}
        />

        <FormField
          label="Employee ID"
          type="text"
          value={formData.empId}
          onChange={(value) => handleInputChange('empId', value)}
          placeholder="e.g. EMP 001"
          required
          error={errors.empId}
        />

        <FormField
          label="Department"
          type="select"
          value={formData.department}
          onChange={(value) => handleInputChange('department', value)}
          options = {departmentOptions}
          placeholder="select department"
        />

        <FormField
          label="Phone Number"
          type="tel"
          value={formData.phoneNumber}
          onChange={(value) => handleInputChange('phoneNumber', value)}
          placeholder="Enter phone number"
        />

        <FormField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => handleInputChange('email', value)}
          placeholder="Enter email address"
          error={errors.email}
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
            {initialData ? 'Update Employee' : 'Save Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RfidModal;