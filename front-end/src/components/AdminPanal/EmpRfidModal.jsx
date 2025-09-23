import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import { ChevronDown } from 'lucide-react';

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

  const departmentOptions = ['Quality Control', 'Cutting', 'Sewing', 'Finishing', 'Packing'];

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
    if (!formData.rfidNumber.trim()) newErrors.rfidNumber = 'RFID Number is required';
    if (!formData.empName.trim()) newErrors.empName = 'Employee Name is required';
    
    if (!formData.empId.trim()) newErrors.empId = 'Employee ID is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Safe form data for backend
    const cleanData = {
      rfidNumber: String(formData.rfidNumber || '').trim(),
      empName: String(formData.empName || '').trim(),
      empId: String(formData.empId || '').trim(),
      status: String(formData.status || 'ACTIVE').trim(),
      department: String(formData.department || '').trim(),
      phoneNumber: String(formData.phoneNumber || '').trim(),
      email: String(formData.email || '').trim()
    };

    console.log('Submitting form data:', cleanData);
    onSave(cleanData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: String(value || '') }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
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
          onChange={(v) => handleInputChange('rfidNumber', v)}
          placeholder="e.g. RFID01-234"
          required
          error={errors.rfidNumber}
        />
        <FormField
          label="Employee Name"
          type="text"
          value={formData.empName}
          onChange={(v) => handleInputChange('empName', v)}
          placeholder="Enter employee name"
          required
          error={errors.empName}
        />
        <FormField
          label="Employee ID"
          type="text"
          value={formData.empId}
          onChange={(v) => handleInputChange('empId', v)}
          placeholder="e.g. EMP001"
          required
          error={errors.empId}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          <select
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">Select Department</option>
            {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <FormField
          label="Phone Number"
          type="tel"
          value={formData.phoneNumber}
          onChange={(v) => handleInputChange('phoneNumber', v)}
          placeholder="Enter phone number"
        />
        <FormField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(v) => handleInputChange('email', v)}
          placeholder="Enter email address"
          error={errors.email}
        />
        <FormField
          label="Status"
          type="select"
          value={formData.status}
          onChange={(v) => handleInputChange('status', v)}
          options={['ACTIVE','INACTIVE']}
        />
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            {initialData ? 'Update Employee' : 'Save Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RfidModal;