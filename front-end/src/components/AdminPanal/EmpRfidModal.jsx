import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';

const EmpRfidModal = ({ isOpen, onClose, onSave, initialData }) => {
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
  const [validRfids, setValidRfids] = useState([]);
  const [loadingRfids, setLoadingRfids] = useState(false);
  const [rfidError, setRfidError] = useState('');

  const departmentOptions = ['Quality Control','Sewing'];

  // Fetch valid RFID numbers
  const fetchValidRfids = async () => {
    try {
      setLoadingRfids(true);
      setRfidError('');
      const response = await axios.get('http://localhost:8001/api/valid-rfids');
      
      if (response.data.success) {
        setValidRfids(response.data.data || []);
        console.log('Valid RFIDs loaded for employee:', response.data.data);
      } else {
        setRfidError('Failed to load valid RFIDs');
        setValidRfids([]);
      }
    } catch (err) {
      console.error('Error fetching valid RFIDs:', err);
      setRfidError('Error loading RFIDs. Please try again.');
      setValidRfids([]);
    } finally {
      setLoadingRfids(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchValidRfids();
    }

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
    setRfidError('');
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    const empIdRegex = /^E[1-9a-f]{3}$/;
    
    if (!formData.rfidNumber.trim()) {
      newErrors.rfidNumber = 'RFID Number is required';
    } else if (!validRfids.includes(formData.rfidNumber.trim())) {
      newErrors.rfidNumber = 'Please select a valid RFID number from the dropdown';
    }
    
    if (!formData.empName.trim()) newErrors.empName = 'Employee Name is required';
    
    if (!formData.empId.trim()) {
       newErrors.empId = 'Employee ID is required';
     } else if (!empIdRegex.test(formData.empId.trim())) {
       newErrors.empId = "Employee ID format invalid. Must be 4 chars: start with 'E' (capital) followed by three characters each 1-9 or a-f (lowercase). Example: E1a3";
     }
    
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

    console.log('Submitting employee RFID data:', cleanData);
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
        
        {/* RFID Number Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RFID Number *
          </label>
          <div className="relative">
            <select
              value={formData.rfidNumber}
              onChange={(e) => handleInputChange('rfidNumber', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.rfidNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loadingRfids}
            >
              <option value="">
                {loadingRfids ? 'Loading RFIDs...' : 'Select RFID Number'}
              </option>
              {validRfids.map(rfid => (
                <option key={rfid} value={rfid}>
                  {rfid}
                </option>
              ))}
            </select>

          </div>
          {rfidError && <p className="text-red-600 text-sm mt-1">{rfidError}</p>}
          {errors.rfidNumber && <p className="text-red-600 text-sm mt-1">{errors.rfidNumber}</p>}
          <p className="text-gray-500 text-xs mt-1">
            Available RFIDs: {validRfids.length}
          </p>
        </div>

        <FormField
          label="Employee Name"
          type="text"
          value={formData.empName}
          onChange={(v) => handleInputChange('empName', v)}
          placeholder="Enter employee name"
          required
          error={errors.empName}
        />

        {/* Department Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          <div className="relative">
            <select
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Department</option>
              {departmentOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <FormField
          label="Employee ID"
          type="text"
          value={formData.empId}
          onChange={(v) => handleInputChange('empId', v)}
          placeholder="e.g. E95c"
          required
          error={errors.empId}
        />

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
          options={['ACTIVE', 'INACTIVE']}
          required
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loadingRfids}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loadingRfids ? 'Loading...' : initialData ? 'Update Employee' : 'Save Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmpRfidModal;