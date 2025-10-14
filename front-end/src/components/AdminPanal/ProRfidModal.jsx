import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';

const ProRfidModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    rfidNumber: '',
    unit: '',
    workplace: '',
    status: 'ACTIVE'
  });

  const [errors, setErrors] = useState({});

  //rfid number
  const [validRfids, setValidRfids] = useState([]);
  const [loadingRfids, setLoadingRfids] = useState(false);

  const unitOptions = ['UNIT A', 'UNIT B', 'UNIT C'];
  const workplaceOptions = ['LINE 1', 'LINE 2', 'LINE 3', 'LINE 4','LINE 5', 'LINE 6', 'LINE 7', 'LINE 8'];

  //fetch valid RFID numbers
  const fetchValidRfids = async () => {
    try {
      setLoadingRfids(true);
      const response = await axios.get('http://localhost:8001/api/valid-rfids');
      setValidRfids(response.data.data || []);
    } catch (err) {
      console.error('Error fetching valid RFIDs:', err);
      setValidRfids([]);
    } finally {
      setLoadingRfids(false);
    }
  };

  // Reset or load initial data
  useEffect(() => {
    if (isOpen) {
      fetchValidRfids();
    }

    if (initialData) {
      setFormData({
        rfidNumber: initialData.rfidNumber || '',
        unit: initialData.unit || '',
        workplace: initialData.workplace || '',
        status: initialData.status || 'ACTIVE'
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

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    if (!formData.rfidNumber.trim()) newErrors.rfidNumber = 'RFID Number is required';
    if (!formData.unit.trim()) newErrors.unit = 'Unit is required';
    if (!formData.workplace.trim()) newErrors.workplace = 'Workplace is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const cleanData = {
      rfidNumber: String(formData.rfidNumber || '').trim(),
      unit: String(formData.unit || '').trim(),
      workplace: String(formData.workplace || '').trim(),
      status: String(formData.status || 'ACTIVE').trim()
    };

    console.log('Submitting product RFID data:', cleanData);
    onSave(cleanData);
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: String(value || '') }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Product RFID' : 'Add New Product RFID'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* RFID Number dropdown*/}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">RFID Number</label>
          <select
            value={formData.rfidNumber}
            onChange={(e) => handleInputChange('rfidNumber', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          {errors.rfidNumber && <p className="text-red-600 text-sm mt-1">{errors.rfidNumber}</p>}
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
          <select
            value={formData.unit}
            onChange={(e) => handleInputChange('unit', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">Select Unit</option>
            {unitOptions.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          {errors.unit && <p className="text-red-600 text-sm mt-1">{errors.unit}</p>}
        </div>

        {/* Workplace */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Workplace</label>
          <select
            value={formData.workplace}
            onChange={(e) => handleInputChange('workplace', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">Select Workplace</option>
            {workplaceOptions.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
          {errors.workplace && <p className="text-red-600 text-sm mt-1">{errors.workplace}</p>}
        </div>

        {/* Status */}
        <FormField
          label="Status"
          type="select"
          value={formData.status}
          onChange={(v) => handleInputChange('status', v)}
          options={['ACTIVE', 'INACTIVE']}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {initialData ? 'Update Product RFID' : 'Save Product RFID'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProRfidModal;
