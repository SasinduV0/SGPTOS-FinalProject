import React from 'react';


const FormField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error,  
  className = '' 
}) => {
  const baseInputClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
  }`;

  const renderInput = () => {

    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={baseInputClasses}
      />
    );
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {renderInput()}
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;