// src/components/AdminPanal/ProRfidModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormField from './FormField'; // assume your FormField accepts label, type, value, onChange, placeholder, error
import { ChevronDown } from 'lucide-react';

/*
  Validation rule: rfidNumber must be exactly 8 digits (numbers only).
  If user types letters, an error message will show.
*/

const ProRfidModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    rfidNumber: '',
    unit: '',
    workplace: '',
    status: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});

  const unitOptions = ['UNIT 1','UNIT 2','UNIT 3'];
  const workplaceOptions = ['LINE 1','LINE 2','LINE 3','LINE 4'];

  useEffect(() => {
    if (initialData) {
      setFormData({
        rfidNumber: initialData.rfidNumber || '',
        unit: initialData.unit || '',
        workplace: initialData.workplace || '',
        status: initialData.status || 'ACTIVE'
      });
    } else {
      setFormData({ rfidNumber: '', unit: '', workplace: '', status: 'ACTIVE' });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Validate: exactly 8 digits, no letters allowed
  const validateForm = () => {
    const newErrors = {};
    const rfidVal = String(formData.rfidNumber || '').trim();

    if (!rfidVal) {
      newErrors.rfidNumber = 'RFID Number is required';
    } else if (!/^[0-9]{8}$/.test(rfidVal)) {
      // show specific message if letters present
      if (/[a-zA-Z]/.test(rfidVal)) {
        newErrors.rfidNumber = 'Letters are not allowed — enter 8 digits only';
      } else {
        newErrors.rfidNumber = 'RFID must be exactly 8 digits';
      }
    }

    if (!formData.unit.trim()) newErrors.unit = 'Unit is required';
    if (!formData.workplace.trim()) newErrors.workplace = 'Workplace is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Clean data
    const clean = {
      rfidNumber: String(formData.rfidNumber || '').trim(),
      unit: String(formData.unit || '').trim(),
      workplace: String(formData.workplace || '').trim(),
      status: String(formData.status || 'ACTIVE').trim()
    };

    onSave(clean);
  };

  // If you want to show error as user types letters:
  const handleInputChange = (field, value) => {
    // keep raw input; we do not strip letters automatically to show error when user types them
    setFormData(prev => ({ ...prev, [field]: String(value || '') }));

    // clear that field's error on typing
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Product RFID' : 'Add Product RFID'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="RFID Number"
          type="text"
          value={formData.rfidNumber}
          onChange={(v) => handleInputChange('rfidNumber', v)}
          placeholder="Enter 8 digits e.g. 12345678"
          required
          error={errors.rfidNumber}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
          <select value={formData.unit} onChange={(e) => handleInputChange('unit', e.target.value)} className="w-full p-3 border rounded-lg">
            <option value="">Select Unit</option>
            {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          {errors.unit && <p className="text-red-600 text-sm mt-1">{errors.unit}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Workplace</label>
          <select value={formData.workplace} onChange={(e) => handleInputChange('workplace', e.target.value)} className="w-full p-3 border rounded-lg">
            <option value="">Select Workplace</option>
            {workplaceOptions.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          {errors.workplace && <p className="text-red-600 text-sm mt-1">{errors.workplace}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} className="w-full p-3 border rounded-lg">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{initialData ? 'Update' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default ProRfidModal;
